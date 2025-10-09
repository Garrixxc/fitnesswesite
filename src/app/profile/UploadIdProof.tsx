"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  initialType: string | null;
  verifiedAt: string | null;
  hasFile: boolean;
};

export default function UploadIdProof({ initialType, verifiedAt, hasFile }: Props) {
  const [type, setType] = useState<string>(initialType ?? "GOVT_ID");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const status = verifiedAt ? "VERIFIED" : hasFile ? "SUBMITTED" : "NOT_SUBMITTED";

  // fetch preview if a file is present
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!hasFile) return;
      const res = await fetch("/api/profile/id/preview", { method: "GET" });
      if (!res.ok) return;
      const ct = res.headers.get("content-type") || "";
      setIsImage(ct.startsWith("image/"));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (!ignore) setPreviewUrl(url);
    }
    load();
    return () => {
      ignore = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [hasFile]);

  async function onUpload() {
    setMsg(null);
    if (!file) return setMsg("Please choose a file first.");
    if (file.size > 5 * 1024 * 1024) return setMsg("File is too large. Max 5 MB.");

    const fd = new FormData();
    fd.append("type", type);
    fd.append("file", file);

    setBusy(true);
    try {
      const res = await fetch("/api/profile/id", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setMsg(data?.error || "Upload failed. Please check the file format.");
      } else {
        setMsg("Uploaded successfully. Refreshing…");
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (e: any) {
      setMsg(e?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-white/90">Identity</h3>
        <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">{status}</span>
      </div>
      <p className="mb-3 text-xs text-white/50">Upload any valid ID (PDF/JPG/PNG/WEBP, &lt;5MB). We store only the file and verification status.</p>

      {previewUrl && (
        <div className="mb-3">
          {isImage ? (
            <img src={previewUrl} alt="Your ID" className="h-32 w-auto rounded-md border border-white/10" />
          ) : (
            <a href="/api/profile/id/preview" target="_blank" className="text-sm text-white/80 underline">
              View uploaded file
            </a>
          )}
        </div>
      )}

      <div className="mb-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90">
          <option value="GOVT_ID">Government ID</option>
          <option value="PASSPORT">Passport</option>
          <option value="DRIVING_LICENSE">Driving license</option>
        </select>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp"
          className="w-full text-sm text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white hover:file:bg-white/15"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button disabled={busy} onClick={onUpload} className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-50">
          {busy ? "Uploading…" : "Upload"}
        </button>
      </div>

      {msg && <div className="text-xs text-red-300">{msg}</div>}
    </div>
  );
}
