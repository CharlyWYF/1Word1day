import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { words } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");

    if (date) {
      const word = await db
        .select()
        .from(words)
        .where(eq(words.displayDate, date))
        .limit(1);

      if (!word.length) {
        return NextResponse.json(null);
      }

      return NextResponse.json(word[0]);
    }

    const allWords = await db
      .select()
      .from(words)
      .orderBy(desc(words.displayDate));

    return NextResponse.json(allWords);
  } catch (error) {
    console.error("Failed to fetch words:", error);
    return NextResponse.json(
      { error: "获取词汇列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { word, phonetic, meaning, imageUrl, displayDate } = body;

    if (!word || !meaning || !displayDate) {
      return NextResponse.json(
        { error: "单词、释义和日期为必填项" },
        { status: 400 }
      );
    }

    const newWord = await db
      .insert(words)
      .values({
        word,
        phonetic: phonetic || "",
        meaning,
        imageUrl: imageUrl || null,
        displayDate,
      })
      .returning();

    return NextResponse.json(newWord[0], { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes("unique") || error?.code === "23505") {
      return NextResponse.json(
        { error: "该日期已有词汇" },
        { status: 409 }
      );
    }
    console.error("Failed to create word:", error);
    return NextResponse.json(
      { error: "创建词汇失败" },
      { status: 500 }
    );
  }
}
