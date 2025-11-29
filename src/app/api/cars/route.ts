import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        pricePerDay: true,
        images: true,
        company: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ok: true, cars });
  } catch (err) {
    console.error("GET /api/cars error:", err);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
