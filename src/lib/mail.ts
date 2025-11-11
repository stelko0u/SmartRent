import nodemailer from "nodemailer";

type Provider = "gmail" | "abv";

interface MailPayload {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

function createTransporter(provider: Provider) {
  if (provider === "gmail") {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  // provider === "abv"
  return nodemailer.createTransport({
    host: "smtp.abv.bg",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ABV_USER,
      pass: process.env.ABV_PASS,
    },
  });
}

export async function sendMail(payload: MailPayload, provider: Provider = "gmail") {
  const transporter = createTransporter(provider);

  // optional verify in dev
  // await transporter.verify();

  const from =
    payload.from ??
    process.env.EMAIL_FROM ??
    (provider === "gmail" ? process.env.GMAIL_USER : process.env.ABV_USER);
  const email: string = Array.isArray(payload.to) ? payload.to[0] : payload.to;
  const message: string =
    payload.text ?? (typeof payload.html === "string" ? payload.html.replace(/<[^>]*>/g, "") : "");

  if (!email) {
    throw new Error("Missing recipient email");
  }

  const info = await transporter.sendMail({
    from: process.env.ABV_USER, // твоя акаунт е подателят (не посетителят)
    to: email, // ✅ имейлът, който човек е въвел, става получател
    subject: "Съобщение от сайта",
    text: message,
    html: `<p>${message}</p>`,
  });

  return info;

  return info;
}
