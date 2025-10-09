"use client";

import { useState } from "react";

export default function EventCreateForm() {
  const [loading, setLoading] = useState(false);
  const [fileErr, setFileErr] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const MAX = 2 * 1024 * 1024;
  const ACCEPT = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileErr(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return setFile(null);
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ACCEPT.includes(ext)) return setFileErr("Allowed: JPG, PNG, WEBP, PDF");
    if (f.size > MAX) return setFileErr("Max 2MB");
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      if (file) fd.set("coverFile", file); // ensure key matches API

      const res = await fetch("/api/events", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      window.location.href = res.headers.get("Location") ?? `/events/${j.slug}`;
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-white/70">Event Name</label>
          <input name="title" required minLength={3}
            placeholder="Mumbai Night 10K"
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
        <div>
          <label className="text-xs text-white/70">Sport</label>
          <select name="sport" defaultValue="RUN"
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40">
            <option value="RUN">Run</option>
            <option value="CYCLING">Cycling</option>
            <option value="SWIM">Swim</option>
            <option value="TRIATHLON">Triathlon</option>
            <option value="TREK">Trek</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-white/70">Start</label>
          <input type="datetime-local" name="startDate" required
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
        <div>
          <label className="text-xs text-white/70">End (optional)</label>
          <input type="datetime-local" name="endDate"
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-white/70">Distance (km)</label>
          <input name="distanceKm" type="number" step="0.1" placeholder="21.1"
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
        <div>
          <label className="text-xs text-white/70">Location</label>
          <input name="location" required placeholder="Mumbai, India"
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-white/70">Description</label>
        <textarea name="description" required minLength={5} rows={5}
          placeholder="Route, kit, contacts…"
          className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
      </div>

      {/* Price/Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-white/70">Price (₹)</label>
          <input name="price" type="number" min={0} defaultValue={0}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
        <div>
          <label className="text-xs text-white/70">Capacity (optional)</label>
          <input name="capacity" type="number" min={1} placeholder="100"
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
      </div>

      {/* File */}
      <div>
        <label className="text-xs text-white/70">Cover file (JPG/PNG/WEBP/PDF, &lt; 2MB)</label>
        <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={onFileChange}
          className="mt-1 block w-full rounded-md border border-white/10 bg-black/40 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white hover:file:bg-white/20"/>
        {fileErr && <p className="mt-1 text-xs text-red-400">{fileErr}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button disabled={loading || !!fileErr}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
          {loading ? "Publishing…" : "Create Event"}
        </button>
        <p className="text-xs text-white/60">Shows up on <span className="text-white">/events</span> after publish.</p>
      </div>
    </form>
  );
}
