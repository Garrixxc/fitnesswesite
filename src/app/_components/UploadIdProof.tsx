"use client";

import { useState } from "react";

const TYPES = ["PASSPORT", "AADHAAR", "DRIVING_LICENSE", "OTHER"];

export default function UploadIdProof({ initialType, verifiedAt }: { initialType?: string | null; verifiedAt?: string | null; }) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>(initialType ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onUpload() {
    if (!file) { setMsg("Please choose a file"); return; }
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("type", type || "OTHER");
      const res = await fetch("/api/profile/id-proof", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      setMsg("Uploaded! Awaiting verification.");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  const status = verifiedAt ? "VERIFIED" : "NOT_VERIFIED";

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-white/80">Identity</div>
        <span className="text-[11px] rounded-full px-2 py-[2px] bg-white/10 text-white/70">{status}</span>
      </div>

      <label className="text-xs text-white/60 block mb-2">ID type</label>
      <select
        className="fh-input mb-3"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="">Select type</option>
        {TYPES.map(t => <option key={t} value={t}>{t.replace("_"," ")}</option>)}
      </select>

      <label className="text-xs text-white/60 block mb-2">Upload (JPG/PNG/PDF, &lt; 2MB)</label>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="fh-input mb-3"
      />

      <button
        onClick={onUpload}
        disabled={busy}
        className="btn-brand w-full disabled:opacity-60"
      >
        {busy ? "Uploading..." : "Upload & Save"}
      </button>

      {msg && <p className="text-xs text-white/70 mt-3">{msg}</p>}

      <p className="text-[11px] text-white/40 mt-3">
        Files are stored securely and are never public. Only you and authorized admins can access them.
      </p>
    </div>
  );
}
