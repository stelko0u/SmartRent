// ...existing code...
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

async function getCurrentUser(req: Request) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${base}/api/auth/me`, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser(req);
    if (!me || me.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { make, model, year, pricePerDay } = body;
    if (!make || !model || !year || !pricePerDay) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // find company record owned by this user (if any)
    const company = await prisma.company.findUnique({
      where: { ownerId: me.id },
    });

    try {
      const car = await prisma.car.create({
        data: {
          make,
          model,
          year: Number(year),
          pricePerDay: Number(pricePerDay),
          // owner relation is required in the schema => connect owner
          owner: { connect: { id: me.id } },
          // optional: connect to company if it exists
          ...(company ? { company: { connect: { id: company.id } } } : {}),
          // images is a required String[] in your schema — provide empty array by default
          images: [],
        },
      });
      return NextResponse.json({ ok: true, car });
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: "Database error creating car. Check prisma schema." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// ...existing code...