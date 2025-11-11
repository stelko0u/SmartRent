import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import prisma from "../../../lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function createTransporter() {
  const ABV_USER = process.env.ABV_USER;
  const ABV_PASS = process.env.ABV_PASS;

  if (ABV_USER && ABV_PASS) {
    return nodemailer.createTransport({
      host: "smtp.abv.bg",
      port: 465,
      secure: true,
      auth: { user: ABV_USER, pass: ABV_PASS },
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
      tls: { rejectUnauthorized: false },
    });
  }

  throw new Error("Липсва конфигурация за имейл (ABV_USER/ABV_PASS).");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !EMAIL_REGEX.test(String(email).toLowerCase().trim())) {
      return NextResponse.json({ error: "Невалиден имейл адрес." }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Генериране на токен и срок
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 час

    // Изтрий стари токени за същия имейл (по избор)
    await prisma.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });

    // Запиши новия токен
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${host}/reset-password?token=${token}&email=${encodeURIComponent(
      normalizedEmail
    )}`;

    // Настройка на транспорт
    const transporter = await createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.ABV_USER || `no-reply@${new URL(host).hostname}`,
      to: normalizedEmail,
      subject: "Инструкции за нулиране на паролата",
      html: `
        <p>Здравей,</p>
        <p>За да нулираш паролата си, натисни бутона по-долу:</p>
        <p><a href="${resetLink}" style="display:inline-block;background-color:#0070f3;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;">Нулирай паролата</a></p>
        <p>Ако не си поискал нулиране, просто игнорирай това съобщение.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Имейлът е изпратен успешно.",
    });
  } catch (err: any) {
    console.error("forgot-password API error:", err);
    return NextResponse.json(
      { error: process.env.NODE_ENV !== "production" ? String(err) : "Вътрешна грешка." },
      { status: 500 }
    );
  }
}
