"use client";
import { useState } from "react";

export default function Page() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Изпращане...");

    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) setStatus("✅ Изпратено успешно!");
    else setStatus("❌ " + (data.error || "Грешка при изпращане."));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-2xl mb-4 font-bold">Изпрати имейл</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow w-full max-w-md">
        <input
          type="text"
          placeholder="Име"
          className="border p-2 w-full mb-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Имейл на получателя"
          className="border p-2 w-full mb-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <textarea
          placeholder="Съобщение"
          className="border p-2 w-full mb-2 rounded"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
          required
        />
        <button className="bg-blue-600 text-white rounded p-2 w-full">Изпрати</button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
