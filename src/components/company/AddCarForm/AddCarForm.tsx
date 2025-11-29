import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

/**
 * AddCarForm with dropzone for up to 12 images (.png/.jpeg).
 * Uploads via multipart/form-data to /api/company/cars and calls onCreated(car) after success.
 *
 * Install: npm i react-dropzone
 */

export default function AddCarForm({
  onCreated,
}: {
  onCreated?: (car: any) => void; // optional callback with created car
}) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [pricePerDay, setPricePerDay] = useState<number | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_FILES = 12;
  const ALLOWED = ["image/png", "image/jpeg"];

  useEffect(() => {
    // revoke object URLs on unmount
    return () => {
      files.forEach((f) => {
        try {
          URL.revokeObjectURL((f as any).__preview);
        } catch {}
      });
    };
  }, [files]);

  const onDrop = (accepted: File[], rejected: any[]) => {
    setError(null);
    if (rejected && rejected.length) {
      setError("Some files were rejected (allowed: .png, .jpeg).");
    }
    const total = files.length + accepted.length;
    if (total > MAX_FILES) {
      setError(`Max ${MAX_FILES} images allowed.`);
      return;
    }
    const valid = accepted.filter((f) => ALLOWED.includes(f.type));
    valid.forEach((f) => {
      (f as any).__preview = URL.createObjectURL(f);
    });
    setFiles((s) => [...s, ...valid]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    maxFiles: MAX_FILES,
  });

  function removeFile(idx: number) {
    const f = files[idx];
    try {
      URL.revokeObjectURL((f as any).__preview);
    } catch {}
    setFiles((s) => s.filter((_, i) => i !== idx));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (!make.trim() || !model.trim() || !year || !pricePerDay) {
        throw new Error("Fill make, model, year and pricePerDay.");
      }
      const form = new FormData();
      form.append("make", make.trim());
      form.append("model", model.trim());
      form.append(
        "year",
        String(typeof year === "string" && year === "" ? new Date().getFullYear() : year)
      );
      form.append("pricePerDay", String(pricePerDay));

      files.forEach((f) => form.append("images", f, f.name));

      const res = await fetch("/api/company/cars", {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        // non-json response
      }

      if (!res.ok) {
        throw new Error((json && json.error) || text || `Upload failed (${res.status})`);
      }

      // success: server should return created car (json.car)
      const created = json?.car ?? json;
      // clear local previews
      files.forEach((f) => {
        try {
          URL.revokeObjectURL((f as any).__preview);
        } catch {}
      });
      setFiles([]);
      setMake("");
      setModel("");
      setYear("");
      setPricePerDay("");
      onCreated?.(created);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2 className="text-xl font-medium mb-4">Add car</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}

      <form onSubmit={submit} className="max-w-xl flex flex-col gap-3">
        <input
          placeholder="Make (e.g. Toyota)"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="px-3 py-2 border rounded"
          required
        />
        <input
          placeholder="Model (e.g. Corolla)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="px-3 py-2 border rounded"
          required
        />
        <input
          placeholder="Year (e.g. 2022)"
          type="number"
          value={year === "" ? "" : String(year)}
          onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
          className="px-3 py-2 border rounded"
          required
        />
        <input
          placeholder="Price per day"
          type="number"
          value={pricePerDay === "" ? "" : String(pricePerDay)}
          onChange={(e) => setPricePerDay(e.target.value === "" ? "" : Number(e.target.value))}
          className="px-3 py-2 border rounded"
          required
        />

        <div
          {...getRootProps()}
          className="p-4 border-dashed border-2 rounded text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop images here...</p>
          ) : (
            <p>Drag & drop .png/.jpeg images here, or click to select (max {MAX_FILES})</p>
          )}
        </div>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2">
            {files.map((f, i) => (
              <div key={i} className="w-24 h-24 relative border rounded overflow-hidden">
                <img
                  src={(f as any).__preview}
                  alt={f.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded px-1 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            {busy ? "Uploading…" : "Add"}
          </button>
        </div>
      </form>
    </section>
  );
}
