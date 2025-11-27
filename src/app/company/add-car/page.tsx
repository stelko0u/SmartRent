// File: page.tsx
// Directory: src/app/company/add-car
// filepath: d:\TU-VARNA\Project\AutoRent\src\app\company\add-car\page.tsx
"use client";
import React, { useState } from "react";

export default function AddCarPage() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [priceDay, setPriceDay] = useState<number | "">("");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Adding...");
    const res = await fetch("/api/company/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ make, model, year: Number(year), pricePerDay: Number(priceDay) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Failed");
      return;
    }
    setMsg("Car added");
    setMake("");
    setModel("");
    setYear("");
    setPriceDay("");
  }

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Add Car</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label>Make</label>
          <input
            value={make}
            onChange={(e) => setMake(e.target.value)}
            required
            className="w-full border p-2"
          />
        </div>
        <div>
          <label>Model</label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
            className="w-full border p-2"
          />
        </div>
        <div>
          <label>Year</label>
          <input
            value={year as any}
            onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
            type="number"
            required
            className="w-full border p-2"
          />
        </div>
        <div>
          <label>Price / day</label>
          <input
            value={priceDay as any}
            onChange={(e) => setPriceDay(e.target.value === "" ? "" : Number(e.target.value))}
            type="number"
            required
            className="w-full border p-2"
          />
        </div>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2">Add Car</button>
        </div>
        <div className="text-sm text-gray-700">{msg}</div>
      </form>
    </div>
  );
}
