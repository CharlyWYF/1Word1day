import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { words } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import WordDetail from "./WordDetail";

interface Props {
  params: Promise<{ id: string }>;
}

async function getWord(id: string) {
  try {
    const result = await db
      .select()
      .from(words)
      .where(eq(words.id, parseInt(id)))
      .limit(1);
    return result[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const word = await getWord(id);

  if (!word) return { title: "词汇未找到 | 每日一词" };

  return {
    title: `${word.word} - ${word.meaning} | 每日一词`,
    description: `${word.word} ${word.phonetic || ""} - ${word.meaning}`,
    openGraph: {
      title: `${word.word} - 每日一词`,
      description: `${word.word} ${word.phonetic || ""} - ${word.meaning}`,
      ...(word.imageUrl ? { images: [{ url: word.imageUrl }] } : {}),
    },
  };
}

export default async function WordPage({ params }: Props) {
  const { id } = await params;
  const word = await getWord(id);

  if (!word) {
    notFound();
  }

  return <WordDetail word={word} />;
}
