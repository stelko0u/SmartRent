"use client";

import React from "react";
import NavItem from "../NavItem/NavItem";
import SignOutButton from "components/auth/SignOutButton/SignOutButton";

export default function Sidebar({
  active,
  setActive,
  isLoggedIn,
}: {
  active: string;
  setActive: (s: string) => void;
  isLoggedIn: boolean;
}) {
  return (
    <aside className="w-64 hidden md:flex flex-col bg-white border-r border-gray-200 min-h-screen p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">
          AR
        </div>
        <div>
          <h3 className="text-lg font-semibold">AutoRental Pro</h3>
          <p className="text-sm text-gray-500">Drive your freedom</p>
        </div>
      </div>

      <nav className="flex-1">
        <NavItem label="Home" active={active === "home"} onClick={() => setActive("home")} />
        <NavItem
          label="Browse Cars"
          active={active === "browse"}
          onClick={() => setActive("browse")}
        />
        <NavItem
          label="My Rentals"
          active={active === "rentals"}
          onClick={() => setActive("rentals")}
        />
        <NavItem
          label="Profile"
          active={active === "profile"}
          onClick={() => setActive("profile")}
        />
      </nav>

      <div className="mt-auto">
        {isLoggedIn ? (
          <SignOutButton />
        ) : (
          <div className="flex gap-2">
            <a
              href="/signin"
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold text-center"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="px-3 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-semibold text-center"
            >
              Sign Up
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
