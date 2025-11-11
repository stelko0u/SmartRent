import { NextResponse } from "next/server";
import prisma from "lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ error: "Липсват данни." }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.email !== email) {
      return NextResponse.json({ valid: false, reason: "Невалиден токен." });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, reason: "Токенът е изтекъл." });
    }

    return NextResponse.json({ valid: true });
  } catch (err: any) {
    console.error("verify-reset-token error:", err);
    return NextResponse.json({ valid: false, reason: "Вътрешна грешка." }, { status: 500 });
  }
}
