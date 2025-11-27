import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function getMe() {
  try {
    const cookieHeader = cookies().toString();
    const base = process.env.NEXT_PUBLIC_BASE_URL || "";
    const url = base
      ? `${base}/api/auth/me`
      : `http://localhost:${process.env.PORT ?? 3000}/api/auth/me`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: { cookie: cookieHeader },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.log("/api/auth/me non-ok body:", text, "status:", res.status);
      return null;
    }

    const json = await res.json();
    // API returns { ok: true, user: {...} } — return the inner user object
    if (json?.ok && json.user) return json.user;
    return null;
  } catch (err) {
    console.error("getMe error:", err);
    return null;
  }
}

export default async function AdminPage() {
  const me = await getMe();
  if (!me || me.role !== "ADMIN") {
    redirect("/signin");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <nav className="space-y-2">
        <a href="/admin/add-company" className="text-blue-600">
          Add Company
        </a>
        <a href="/admin/companies" className="text-blue-600">
          Manage Companies
        </a>
      </nav>
    </div>
  );
}
