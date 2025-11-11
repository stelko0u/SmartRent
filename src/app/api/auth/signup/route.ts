import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d"; // 7 days
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // seconds

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body || {};

    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET");
      return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
    }

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        ...(name ? { name } : {}),
      },
      select: { id: true, email: true, name: true },
    });

    // create JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // set httpOnly cookie for 7 days
    const res = NextResponse.json(
      { message: "User created successfully", user, token },
      { status: 201 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return res;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: error?.message || "Server error" }, { status: 500 });
  }
}
