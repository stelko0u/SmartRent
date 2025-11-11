import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ error: "Липсват данни." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.abv.bg",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ABV_USER,
        pass: process.env.ABV_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.ABV_USER,
      to: email, // <-- получател е въведения имейл
      subject: "Тестово съобщение от Next.js",
      text: `Здравей ${name || ""}! Това е тестово съобщение.`,
      html: `<h3>Здравей ${name || ""}!</h3><p>${message}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Грешка при изпращане:", err);
    return NextResponse.json({ error: err.message || "Неуспешно изпращане" }, { status: 500 });
  }
}
