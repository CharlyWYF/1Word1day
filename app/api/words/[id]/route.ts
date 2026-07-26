import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { words } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(words)
      .where(eq(words.id, parseInt(id)))
      .limit(1);

    if (!result.length) {
      return NextResponse.json({ error: "词汇不存在" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Failed to fetch word:", error);
    return NextResponse.json(
      { error: "获取词汇失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { word, phonetic, meaning, imageUrl, displayDate } = body;

    if (!word || !meaning || !displayDate) {
      return NextResponse.json(
        { error: "单词、释义和日期为必填项" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(words)
      .set({
        word,
        phonetic: phonetic || "",
        meaning,
        imageUrl: imageUrl || null,
        displayDate,
      })
      .where(eq(words.id, parseInt(id)))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "词汇不存在" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("Failed to update word:", error);
    return NextResponse.json(
      { error: "更新词汇失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.delete(words).where(eq(words.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete word:", error);
    return NextResponse.json(
      { error: "删除词汇失败" },
      { status: 500 }
    );
  }
}
