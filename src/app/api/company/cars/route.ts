import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";

const ALLOWED = ["image/png", "image/jpeg"];
const MAX_FILES = 12;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function fetchMe(req: NextRequest) {
  const origin =
    req.nextUrl?.origin ??
    `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;
  const meRes = await fetch(`${origin}/api/auth/me`, {
    method: "GET",
    headers: { Accept: "application/json", Cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
    redirect: "follow",
  });
  return meRes;
}

export async function POST(req: NextRequest) {
  try {
    // auth
    const meRes = await fetchMe(req);
    if (!meRes.ok) {
      const text = await meRes.text().catch(() => "");
      console.error("/api/auth/me failed:", meRes.status, text);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const ct = meRes.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      console.error("/api/auth/me non-json:", await meRes.text());
      return NextResponse.json({ error: "Unexpected auth response" }, { status: 500 });
    }
    const me = await meRes.json();

    const rawRole = me?.role ?? me?.user?.role ?? null;
    const role = typeof rawRole === "string" ? rawRole.toLowerCase().trim() : null;
    if (role !== "company") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const companyId = me?.company?.id ?? me?.user?.companyId ?? null;
    const ownerId = me?.user?.id ?? null;
    if (!companyId || !ownerId)
      return NextResponse.json({ error: "Missing company or owner id" }, { status: 400 });

    // decide how body is sent
    const contentType = (req.headers.get("content-type") || "").toLowerCase();

    let make: string | null = null;
    let model: string | null = null;
    let year: number | null = null;
    let pricePerDay: number | null = null;
    const images: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      // multipart: parse formData and files
      const form = await req.formData();
      make = String(form.get("make") ?? "").trim();
      model = String(form.get("model") ?? "").trim();
      year = Number(form.get("year") ?? new Date().getFullYear());
      pricePerDay = Number(form.get("pricePerDay") ?? 0);

      // collect files - form.getAll('images')
      const fileEntries = form.getAll("images");
      if (fileEntries.length > MAX_FILES)
        return NextResponse.json({ error: "Too many files" }, { status: 400 });

      const uploadDir = path.join(process.cwd(), "public", "uploads", "company", String(companyId));
      ensureDir(uploadDir);

      for (const ent of fileEntries) {
        // ent is a File web API object in Node runtime
        // @ts-ignore
        const file: any = ent;
        if (!file || !file.type || !ALLOWED.includes(file.type)) continue;
        // read bytes
        const arrayBuf = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const ext = file.type === "image/png" ? ".png" : ".jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        images.push(`/uploads/company/${companyId}/${fileName}`);
      }
    } else {
      // assume JSON body
      let body: any = null;
      try {
        body = await req.json();
      } catch (err) {
        console.error("Failed to parse JSON body:", err);
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
      make = String(body.make ?? "").trim();
      model = String(body.model ?? "").trim();
      year = body.year ? Number(body.year) : new Date().getFullYear();
      pricePerDay = body.pricePerDay ? Number(body.pricePerDay) : 0;
      if (Array.isArray(body.images)) {
        // assume body.images are already public paths or URLs
        for (const it of body.images) {
          if (typeof it === "string") images.push(it);
        }
      }
    }

    if (!make || !model || !year || !pricePerDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // create car
    const created = await prisma.car.create({
      data: {
        make,
        model,
        year: Number(year),
        pricePerDay: Number(pricePerDay),
        images,
        ownerId: Number(ownerId),
        companyId: Number(companyId),
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        pricePerDay: true,
        images: true,
        companyId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ car: created }, { status: 201 });
  } catch (err) {
    console.error("company/cars POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const origin =
      req.nextUrl?.origin ??
      `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;

    const meRes = await fetch(`${origin}/api/auth/me`, {
      method: "GET",
      headers: { Accept: "application/json", Cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
      redirect: "follow",
    });

    if (!meRes.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const ct = meRes.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      console.error("/api/auth/me non-json:", await meRes.text());
      return NextResponse.json({ error: "Unexpected auth response" }, { status: 500 });
    }
    const me = await meRes.json();

    const rawRole = me?.role ?? me?.user?.role ?? null;
    const role = typeof rawRole === "string" ? rawRole.toLowerCase().trim() : null;
    if (role !== "company") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const companyId = me?.company?.id ?? me?.user?.companyId ?? null;
    if (!companyId) return NextResponse.json({ error: "Company id missing" }, { status: 400 });

    const cars = await prisma.car.findMany({
      where: { companyId: Number(companyId) },
      orderBy: { id: "desc" },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        pricePerDay: true,
        images: true,
        companyId: true,
      },
    });

    return NextResponse.json({ cars }, { status: 200 });
  } catch (err) {
    console.error("company/cars GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
