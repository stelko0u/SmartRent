"use client";

// ...existing code...
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password, remember }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError((data && data.error) || "Sign in failed");
        setLoading(false);
        return;
      }

      // success - reload or navigate so /api/auth/me is rechecked
      // router.push("/") is enough; use reload to be sure cookie is applied immediately
      router.replace("/");
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md p-8 bg-white dark:bg-slate-900/80 shadow-xl rounded-xl"
    >
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Your password"
          required
          minLength={6}
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Remember me
        </label>

        <a href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
          Forgot password?
        </a>
      </div>

      <div className="flex flex-col gap-3 mt-6">
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-indigo-600 font-semibold hover:underline">
            Sign Up
          </a>
        </div>
      </div>
    </form>
  );
}
// ...existing code...
