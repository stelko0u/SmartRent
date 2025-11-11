// ...existing code...
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/layouts/Sidebar/Sidebar";
import MobileTopBar from "../components/layouts/MobileTopBar/MobileTopBar";
import Hero from "components/Hero/Hero";
import FeaturedGrid from "components/Featured/Featured";
import SignOutButton from "components/auth/SignOutButton/SignOutButton";

const SAMPLE_CARS = [
  {
    id: 1,
    name: "Tesla Model 3",
    type: "Electric",
    pricePerDay: 89,
    img: "https://images.unsplash.com/photo-1549921296-3f0f0f6f3e1f?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "BMW 3 Series",
    type: "Sedan",
    pricePerDay: 75,
    img: "https://images.unsplash.com/photo-1519643381401-22c77e60520e?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Jeep Wrangler",
    type: "SUV",
    pricePerDay: 95,
    img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80&auto=format&fit=crop",
  },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          signal: ac.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          setIsLoggedIn(false);
          return;
        }
        const data = await res.json();
        setIsLoggedIn(Boolean(data && data.ok));
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        console.warn("auth check failed", err);
        setIsLoggedIn(false);
      }
    }
    checkAuth();
    return () => ac.abort();
  }, []);

  const filtered = SAMPLE_CARS.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex">
        <Sidebar active={active} setActive={setActive} isLoggedIn={isLoggedIn} />

        <main className="flex-1 p-6">
          <MobileTopBar active={active} setActive={setActive} isLoggedIn={isLoggedIn} />
          <Hero query={query} setQuery={setQuery} setActive={setActive} />
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Featured cars</h2>
              <p className="text-sm text-gray-500">{filtered.length} results</p>
            </div>
            <FeaturedGrid cars={filtered} />
          </section>
        </main>
      </div>
    </div>
  );
}
