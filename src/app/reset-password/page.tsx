"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [reason, setReason] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔍 Проверка дали токенът е валиден
  useEffect(() => {
    async function checkToken() {
      if (!email || !token) {
        setReason("Невалиден линк.");
        setValid(false);
        setValidating(false);
        return;
      }

      try {
        const res = await fetch("/api/verify-reset-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });
        const data = await res.json();

        if (data.valid) {
          setValid(true);
        } else {
          setReason(data.reason || "Токенът е невалиден.");
          setValid(false);
        }
      } catch (err: any) {
        setReason("Грешка при проверка на токена.");
        setValid(false);
      } finally {
        setValidating(false);
      }
    }

    checkToken();
  }, [email, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Паролите не съвпадат.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Грешка при смяна на паролата");

      setSuccess("Паролата е сменена успешно!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🕐 Докато проверяваме
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Проверка на токена...</p>
      </div>
    );
  }

  // ❌ Ако токенът е невалиден или изтекъл
  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Невалиден линк</h2>
          <p className="text-gray-600">{reason}</p>
          <a href="/forgot-password" className="mt-4 inline-block text-blue-600 hover:underline">
            Изпрати нов линк за нулиране
          </a>
        </div>
      </div>
    );
  }

  // ✅ Ако токенът е валиден — показваме формата
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Нова парола</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

        <label className="block mb-3">
          <span className="text-gray-700">Нова парола</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border rounded-md p-2"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Повтори паролата</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="mt-1 block w-full border rounded-md p-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          {loading ? "Изпращане..." : "Запази новата парола"}
        </button>
      </form>
    </div>
  );
}
