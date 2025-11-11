import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, token, password } = await req.json();

    const localNow = new Date();
    // const offsetMs = localNow.getTimezoneOffset() * 60 * 1000;
    const offsetMs = localNow.getTimezoneOffset() * 60 * 100;

    const localDate = new Date(localNow.getTime() - offsetMs);

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        // expiresAt: new Date(localDate.getTime() + 1000 * 60 * 60), // +1 час
        expiresAt: new Date(localDate.getTime() + 500), // +5 минути за тестове
      },
    });

    if (!email || !token || !password) {
      return NextResponse.json({ error: "Липсват данни." }, { status: 400 });
    }

    // 1️⃣ Намери токена в базата
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record) {
      return NextResponse.json({ error: "Невалиден или използван токен." }, { status: 400 });
    }

    // 2️⃣ Провери дали е за същия имейл
    if (record.email !== email) {
      return NextResponse.json({ error: "Имейлът не съвпада с токена." }, { status: 400 });
    }

    // 3️⃣ Провери дали е изтекъл
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Токенът е изтекъл." }, { status: 400 });
    }

    // 4️⃣ Хеширай новата парола
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Запиши новата парола в таблицата с потребители
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // 6️⃣ Изтрий използвания токен
    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ success: true, message: "Паролата е сменена успешно." });
  } catch (err: any) {
    console.error("reset-password error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
