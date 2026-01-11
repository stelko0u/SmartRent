import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.SITE_URL ??
  'http://localhost:3000';
type Provider = 'gmail' | 'abv';

interface MailPayload {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

function createTransporter(provider: Provider) {
  if (provider === 'gmail') {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: 'smtp.abv.bg',
    port: 465,
    secure: true,
    auth: {
      user: process.env.ABV_USER,
      pass: process.env.ABV_PASS,
    },
  });
}

export async function sendMail(
  payload: MailPayload,
  provider: Provider = 'gmail'
) {
  const transporter = createTransporter(provider);

  const defaultFrom =
    payload.from ??
    process.env.EMAIL_FROM ??
    (provider === 'gmail' ? process.env.GMAIL_USER : process.env.ABV_USER);
  const email: string = Array.isArray(payload.to) ? payload.to[0] : payload.to;
  const message: string =
    payload.text ??
    (typeof payload.html === 'string'
      ? payload.html.replace(/<[^>]*>/g, '')
      : '');

  if (!email) {
    throw new Error('Missing recipient email');
  }

  const info = await transporter.sendMail({
    from: defaultFrom,
    to: email,
    subject: payload.subject ?? 'Съобщение от сайта',
    text: message,
    html: payload.html ?? `<p>${message}</p>`,
  });

  return info;
}

export async function sendVerificationEmail(
  email: string,
  userId: number,
  provider: Provider = 'abv'
) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET not configured');
  const token = jwt.sign({ userId, type: 'verify-email' }, JWT_SECRET, {
    expiresIn: '24h',
    subject: String(userId),
  });

  const verifyUrl = `${APP_URL}/api/auth/verify?token=${encodeURIComponent(
    token
  )}`;

  const subject = 'Verify your Smart Rent account';
  const text = `Please verify your email by visiting: ${verifyUrl}`;
  const html = `
    <p>Thanks for registering at Smart Rent.</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verifyUrl}">Verify my email</a></p>
    <p>This link will expire in 24 hours. If you did not create an account, ignore this message.</p>
  `;

  return sendMail(
    {
      to: email,
      subject,
      text,
      html,
    },
    provider
  );
}
