# 每日一词 (One Word a Day) — 实现方案

## 背景

开发一个极简每日一词网站每天添加一个英文词 + 配图，页面类似 PowerPoint 布局（左侧时间轴词表 + 右侧大词展示），采用液态玻璃（glassmorphism）风格，浅色渐变背景。

## 技术栈

| 层面 | 选择 | 原因 |
|------|------|------|
| 框架 | **Next.js 16** (App Router) | 部署 Vercel，SSR/SSG 灵活 |
| 样式 | **Tailwind CSS v4** | 搭配 glassmorphism 方便 |
| 数据库 | **Vercel Postgres** (via `@vercel/postgres`) + **Drizzle ORM** | 无需外部服务，Vercel 原生 |
| 图片存储 | **Vercel Blob** | 上传/CDN/部署一体 |
| 认证 | **JWT** (jose) + httpOnly cookie | 简单密码保护管理后台 |
| 语音 | **Web Speech API** | 浏览器原生 TTS，零依赖 |
| 部署 | **Vercel** + 自有域名 | 已确认 |

## 项目结构

```
├── .env.local                         # 环境变量（本地）
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── app/
│   ├── globals.css                    # 全局样式 + glassmorphism 工具类
│   ├── layout.tsx                     # 根布局（渐变背景 + 字体）
│   ├── page.tsx                       # 首页：左侧词表 + 右侧主展示
│   ├── admin/
│   │   ├── layout.tsx                 # 管理后台布局（auth 验证）
│   │   ├── page.tsx                   # 后台首页（词列表管理）
│   │   ├── new/
│   │   │   └── page.tsx               # 添加新词表单页
│   │   └── edit/
│   │       └── [id]/
│   │           └── page.tsx           # 编辑已有词
│   ├── login/
│   │   └── page.tsx                   # 管理员登录页
│   ├── words/
│   │   └── [id]/
│   │       └── page.tsx               # 单个词的分享/SEO 页面
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts         # POST - 登录
│       │   └── logout/route.ts        # POST - 登出
│       ├── words/
│       │   ├── route.ts               # GET(列表) / POST(创建)
│       │   └── [id]/route.ts          # PUT(更新) / DELETE(删除)
│       └── upload/
│           └── route.ts               # POST - 上传图片
├── components/
│   ├── GlassCard.tsx                  # 可复用的毛玻璃卡片
│   ├── GradientBackground.tsx         # 渐变色背景
│   ├── WordDisplay.tsx                # 主展示区（大词 + 音标 + 中文）
│   ├── WordList.tsx                   # 左侧边栏词表
│   ├── TTSButton.tsx                  # 语音播放按钮
│   └── admin/
│       ├── LoginForm.tsx              # 登录表单
│       ├── WordForm.tsx               # 添加/编辑词表单
│       ├── ImageUploader.tsx          # 图片上传组件
│       └── AdminGuard.tsx             # 认证守卫组件
├── lib/
│   ├── db.ts                          # 数据库连接
│   ├── schema.ts                      # Drizzle 数据模型
│   └── auth.ts                        # JWT 工具函数
├── proxy.ts                           # Next.js 16 路由守卫（替代 middleware.ts）
└── drizzle.config.ts                  # Drizzle Kit 配置
```

## 数据模型 (Drizzle Schema)

```ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const words = pgTable('words', {
  id: serial('id').primaryKey(),
  word: text('word').notNull(),
  phonetic: text('phonetic'),           // 音标，如 /ˈwɜːrd/
  meaning: text('meaning').notNull(),   // 中文释义
  imageUrl: text('image_url'),          // Vercel Blob URL
  displayDate: text('display_date').notNull().unique(), // ISO 日期 "2026-07-26"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## 组件树

```
RootLayout
├── GradientBackground (fixed, 全屏渐变)
└── Main
    ├── [Public] /
    │   ├── Sidebar (WordList)
    │   │   └── WordListItem × N (按日期倒序)
    │   └── MainContent (WordDisplay)
    │       ├── WordHeader (巨大的单词)
    │       ├── PhoneticText (音标)
    │       ├── TTSButton (语音播放)
    │       ├── MeaningText (中文释义)
    │       └── WordImage (配图, GlassCard 包裹)
    │
    ├── [Public] /login
    │   └── LoginForm (密码输入 + 提交)
    │
    └── [Protected] /admin
        ├── AdminGuard (验证 JWT cookie)
        ├── AdminPage → 所有词汇列表 + "添加"按钮
        ├── /admin/new → WordForm + ImageUploader
        └── /admin/edit/[id] → WordForm (预填充) + ImageUploader
```

## 路由 & API 设计

### 页面路由

| 路径 | 公开? | 说明 |
|------|-------|------|
| `/` | ✅ | 首页 — 显示今天词汇，侧边栏展示所有历史词 |
| `/words/[id]` | ✅ | 单个词详情/SEO 页 |
| `/login` | ✅ | 管理员登录 |
| `/admin` | ❌ | 管理后台 — 词汇列表 |
| `/admin/new` | ❌ | 添加新词 |
| `/admin/edit/[id]` | ❌ | 编辑词汇 |

### API 路由

| 路径 | 方法 | 认证 | 功能 |
|------|------|------|------|
| `/api/auth/login` | POST | ❌ | 验证密码 → 返回 JWT cookie |
| `/api/auth/logout` | POST | ❌ | 清除 cookie |
| `/api/auth/verify` | GET | ❌ | 检查当前 session 是否有效 |
| `/api/words` | GET | ❌ | 获取所有词（按日期倒序） |
| `/api/words` | POST | ✅ | 创建新词 |
| `/api/words/[id]` | GET | ❌ | 获取单个词汇详情 |
| `/api/words/[id]` | PUT | ✅ | 更新词 |
| `/api/words/[id]` | DELETE | ✅ | 删除词 |
| `/api/upload` | POST | ✅ | 上传图片 → 返回 Blob URL |

### proxy.ts 守卫逻辑

```ts
// proxy.ts — Next.js 16 路由守卫
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token');
    let isValid = false;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        isValid = true;
      } catch {}
    }
    if (!isValid) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  return NextResponse.next();
}
```

## 数据流

### 管理员添加词汇
1. 登录 `/login` → POST `/api/auth/login` → 设置 JWT cookie
2. 在 `/admin/new` 填写表单：word, phonetic, meaning, displayDate
3. 上传图片 → ImageUploader → POST `/api/upload` → Vercel Blob → 返回 URL
4. 提交表单 → POST `/api/words` (body: { word, phonetic, meaning, imageUrl, displayDate })
5. 服务器验证 JWT → 写入 Vercel Postgres → 重定向回 `/admin`

### 用户访问首页
1. 访问 `/` → Client Component 渲染
2. 前端 GET `/api/words` → 获取所有词汇（按日期倒序）
3. 找到 `display_date === today` 的词作为主展示
4. 若今天无词，则显示最近的词
5. 侧边栏点击某个词 → 通过 `useSearchParams` (`?id=3`) 切换主展示区
6. TTSButton 调用 `window.speechSynthesis.speak()` 朗读英文单词

## 液态玻璃 (Glassmorphism) 设计

### 配色方案

**背景渐变（浅色模式）**：
```
from-pink-100 via-purple-100 to-blue-100
from-amber-100 via-rose-100 to-indigo-100
from-sky-100 via-indigo-50 to-purple-100
from-teal-50 via-cyan-50 to-sky-100
from-rose-50 via-fuchsia-50 to-purple-100
```
按日期轮换，每天不同渐变。

**玻璃元素样式**：
```css
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}
```

**Tailwind 等价**：
```html
<div class="bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg">
```

### 页面布局（左侧栏 + 右侧主区）

```
┌─────────────────────────────────────────────┐
│  渐变背景 (from-pink-100 via-purple-100 …)   │
│  ┌──────────┐ ┌──────────────────────────┐  │
│  │ 侧边栏    │ │  主展示区 (玻璃卡片)       │  │
│  │ (玻璃卡片)│ │                           │  │
│  │           │ │     S E R E N D I P I T Y │  │
│  │ 2026-07-26│ │       /sɪˈrendɪpəti/     │  │
│  │ Serendipity│ │       意外发现美好事物     │  │
│  │ 2026-07-25│ │                           │  │
│  │ Ephemeral  │ │    [ 🖼️ 配图 ]          │  │
│  │ ...       │ │                           │  │
│  └──────────┘ └──────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 无障碍 & 降级
- `@supports (backdrop-filter: blur(1px))` 兜底 → 实色背景
- `prefers-reduced-transparency` 媒体查询 → 移除模糊，使用实色背景
- 文字对比度保证 WCAG AA (4.5:1)

## 图片处理策略

| 环境 | 方案 |
|------|------|
| 本地开发 | 无数据库时可跳过，有 Vercel Blob token 即可上传 |
| 生产 (Vercel) | **Vercel Blob** — 上传 → CDN URL → 存入 DB |

ImageUploader 组件流程：
1. 点击/拖拽选择图片文件
2. 客户端验证（类型、大小 ≤ 5MB）
3. 显示本地预览
4. POST `/api/upload` (multipart/form-data) → Vercel Blob
5. 返回 URL → 存入表单 state → 提交词汇时保存

## 认证方案

极简密码认证，适合单人管理：

1. `.env.local` 设置 `ADMIN_PASSWORD` + `JWT_SECRET`
2. 登录页输入密码 → POST `/api/auth/login`
3. 服务端 `bcryptjs` 比对密码哈希 → 签名 JWT → 设置 httpOnly cookie（24h 有效期）
4. `proxy.ts` 拦截 `/admin/*` 路径 → 验证 cookie → 未登录则重定向到 `/login`
5. 退出 → POST `/api/auth/logout` → 清除 cookie

## 部署于 Vercel

### 所需环境变量
```
ADMIN_PASSWORD=your_strong_password
JWT_SECRET=random_jwt_signing_secret
BLOB_READ_WRITE_TOKEN=vercel_blob_token
POSTGRES_URL=vercel_postgres_url
```

### 部署步骤
1. `git init && git add . && git commit -m "init"`
2. 在 GitHub 创建仓库并推送
3. 在 Vercel 导入仓库（自动检测 Next.js）
4. 在 Vercel Dashboard → Settings → Environment Variables 设置上述变量
5. 在 Vercel Storage 创建 Postgres 数据库 + Blob 存储
6. `npx drizzle-kit push` 创建数据库表
7. 在 Vercel Dashboard → Domains 绑定自定义域名
8. 部署完成 ✅

## 实施步骤（完成状态）

| Phase | 状态 | 内容 |
|-------|------|------|
| **Phase 1** | ✅ 已完成 | 项目初始化，依赖安装，配置 Tailwind v4 |
| **Phase 2** | ✅ 已完成 | `schema.ts`, `db.ts`, `drizzle.config.ts` |
| **Phase 3** | ✅ 已完成 | `auth.ts`, `proxy.ts`, 登录 API, 登录页 |
| **Phase 4** | ✅ 已完成 | 词汇 CRUD API, 图片上传 API, auth verify API |
| **Phase 5** | ✅ 已完成 | GlassCard, GradientBackground, WordDisplay, TTSButton, WordList, HomePage |
| **Phase 6** | ✅ 已完成 | AdminGuard, LoginForm, ImageUploader, WordForm, 管理后台页面 |
| **Phase 7** | ✅ 已完成 | SEO 单页, remotePatterns, metadata, 无障碍降级 |
| **Phase 8** | ⏳ 待处理 | Git 初始化 → GitHub → Vercel 部署 → 域名绑定 |

## 验证方式

1. **本地验证**：`npm run dev` → 访问 `http://localhost:3000`
2. **管理后台**：访问 `/login` → 输入密码 → 添加一个词
3. **主页展示**：访问 `/` → 左侧栏显示刚添加的词，右侧显示详情
4. **TTS 测试**：点击播放按钮 → 浏览器朗读单词
5. **图片上传**：在后台上传图片 → 主页显示配图
6. **构建验证**：`npm run build` → 无错误
7. **部署验证**：推送到 GitHub → Vercel 自动部署 → 访问自定义域名
