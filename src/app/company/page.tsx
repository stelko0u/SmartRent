// File: page.tsx
// Directory: src/app/admin
// filepath: d:\TU-VARNA\Project\AutoRent\src\app\admin\page.tsx
import React from "react";
import { redirect } from "next/navigation";

async function getMe() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/auth/me`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminPage() {
  const me = await getMe();
  if (!me || me.role !== "ADMIN") {
    // not authorized -> redirect to signin
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
          Manage Companies (todo)
        </a>
      </nav>
    </div>
  );
}
