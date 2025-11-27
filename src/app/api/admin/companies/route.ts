// File: route.ts
// Directory: src/app/api/admin/companies
// filepath: d:\TU-VARNA\Project\AutoRent\src\app\api\admin\companies\route.ts
import { NextResponse } from "next/server";
import jwt, { JwtPayload, JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import prisma from "../../../../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "token";

function getTokenFromRequest(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.substring(7).trim();
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

async function requireAdmin(req: Request) {
  if (!JWT_SECRET)
    return {
      ok: false,
      resp: NextResponse.json({ error: "server_misconfigured" }, { status: 500 }),
    };
  const token = getTokenFromRequest(req);
  if (!token) return { ok: false, resp: NextResponse.json({ error: "no_token" }, { status: 401 }) };
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload | Record<string, any>;
    const userId = Number((payload as any).userId ?? payload.sub ?? null);
    if (!userId || Number.isNaN(userId))
      return { ok: false, resp: NextResponse.json({ error: "invalid_token" }, { status: 401 }) };
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user)
      return { ok: false, resp: NextResponse.json({ error: "user_not_found" }, { status: 404 }) };
    if (user.role !== "ADMIN")
      return { ok: false, resp: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
    return { ok: true, user };
  } catch (err) {
    if (err instanceof TokenExpiredError)
      return { ok: false, resp: NextResponse.json({ error: "token_expired" }, { status: 401 }) };
    if (err instanceof JsonWebTokenError)
      return { ok: false, resp: NextResponse.json({ error: "invalid_token" }, { status: 401 }) };
    console.error("requireAdmin error:", err);
    return { ok: false, resp: NextResponse.json({ error: "internal_error" }, { status: 500 }) };
  }
}

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        maintenancePercent: true,
        ownerId: true,
        createdAt: true,
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ ok: true, companies });
  } catch (err) {
    console.error("GET /api/admin/companies error:", err);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;
  try {
    const body = await req.json();
    const { id, maintenancePercent, name, email } = body;
    if (!id) return NextResponse.json({ ok: false, error: "id_required" }, { status: 400 });

    const data: any = {};
    if (maintenancePercent !== undefined) {
      const m = Number(maintenancePercent);
      if (!Number.isFinite(m) || m < 0 || m > 100)
        return NextResponse.json({ ok: false, error: "invalid_maintenance" }, { status: 400 });
      data.maintenancePercent = m;
    }
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;

    const updated = await prisma.company.update({ where: { id: Number(id) }, data });
    return NextResponse.json({ ok: true, company: updated });
  } catch (err: any) {
    // handle unique constraint or other prisma errors
    console.error("PATCH /api/admin/companies error:", err);
    return NextResponse.json({ ok: false, error: err?.message || "update_error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ ok: false, error: "id_required" }, { status: 400 });

    // Optionally delete related records; here we delete company and optionally its owner user
    const company = await prisma.company.findUnique({ where: { id: Number(id) } });
    if (!company) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

    // delete company
    await prisma.company.delete({ where: { id: Number(id) } });
    // optionally delete user who owned it (ownerId) — comment out if you don't want this
    try {
      await prisma.user.delete({ where: { id: company.ownerId } });
    } catch (e) {
      // if user deletion fails, log but continue
      console.warn("Failed deleting owner user:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/companies error:", err);
    return NextResponse.json({ ok: false, error: "delete_error" }, { status: 500 });
  }
}
