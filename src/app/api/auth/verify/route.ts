// ...existing code...
/**
 * File: src/app/api/auth/verify/route.ts
 * Author: GitHub Copilot
 * Purpose: Verify email token and mark account as verified
 */
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!token || !JWT_SECRET) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    if (payload?.type !== "verify-email" || !payload?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const userId = Number(payload.userId);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user id in token" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      });
    }

    // Redirect to frontend signin page with a flag
    const frontend = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const redirectUrl = `${frontend}/signin?verified=1`;
    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    console.error("GET /api/auth/verify error:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
// ...existing code...
