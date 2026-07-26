import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

let passwordHash: string | null = null;

async function getAdminHash(): Promise<string> {
  if (!passwordHash && process.env.ADMIN_PASSWORD) {
    passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  }
  return passwordHash || "";
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "密码不能为空" },
        { status: 400 }
      );
    }

    const hash = await getAdminHash();
    const isValid = await bcrypt.compare(password, hash);

    if (!isValid) {
      return NextResponse.json(
        { error: "密码错误" },
        { status: 401 }
      );
    }

    await createSession();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "登录失败" },
      { status: 500 }
    );
  }
}
