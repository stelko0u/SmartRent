// ...existing code...
"use client";

import React, { useEffect, useState } from "react";
import CompanySidebar from "../../components/company/CompanySidebar/CompanySidebar";
import CompanyDashboard from "../../components/company/CompanyDashboard/CompanyDashboard";
import ManageCars from "../../components/company/ManageCars/ManageCars";
import AddCarForm from "../../components/company/AddCarForm/AddCarForm";
import { Car } from "../../components/company/CompanyDashboard/CompanyDashboard";
import { useSearchParams } from "next/navigation";

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json"))
    throw new Error(`Expected JSON but got ${ct || "unknown"} (status ${res.status})`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON response");
  }
}

export default function CompanyPage() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<string>("dashboard");
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (active === "manage-cars" || active === "dashboard") loadCompanyAndCars();
  }, [active]);

  useEffect(() => {
    const tab = searchParams?.get("tab") ?? searchParams?.get("section");
    if (tab && typeof tab === "string") {
      setActive(tab);
    }
  }, [searchParams]);

  async function loadCompanyAndCars() {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch("/api/company/me", { credentials: "include", cache: "no-store" });
      if (!meRes.ok) throw new Error(`Auth error (${meRes.status})`);
      const me = await parseJsonSafe(meRes);
      setCompanyName(me.company?.name ?? null);

      const carsRes = await fetch("/api/company/cars", {
        credentials: "include",
        cache: "no-store",
      });
      if (!carsRes.ok) throw new Error(`Cars load error (${carsRes.status})`);
      const carsJson = await parseJsonSafe(carsRes);
      setCars(Array.isArray(carsJson.cars) ? carsJson.cars : []);
    } catch (err: any) {
      setError(err.message || "Loading failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(data: {
    make: string;
    model: string;
    year: number;
    pricePerDay: number;
    images: string[];
  }) {
    const res = await fetch("/api/company/cars", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Add failed (${res.status}) ${txt}`);
    }
    const json = await parseJsonSafe(res);
    setCars((c) => [json.car, ...c]);
  }

  async function handleDelete(id: number) {
    // placeholder: implement API DELETE /api/company/cars/:id
    setCars((c) => c.filter((x) => x.id !== id));
  }

  async function handleEdit(id: number) {
    // placeholder
    console.log("edit", id);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex">
        <CompanySidebar active={active} setActive={setActive} />
        <main className="flex-1 p-6">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">
              {companyName ? `Company: ${companyName}` : "Company area"}
            </h1>
            <p className="text-sm text-gray-500">Use the sidebar to manage cars</p>
          </header>

          {loading && <div>Loading…</div>}
          {error && <div className="mb-4 text-red-600">{error}</div>}

          {active === "dashboard" && <CompanyDashboard cars={cars} />}
          {active === "manage-cars" && (
            <ManageCars cars={cars} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          {active === "add-car" && (
            <AddCarForm onCreated={(car) => setCars((c) => [car, ...c])} />
          )}
        </main>
      </div>
    </div>
  );
}
