"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Sport = "RUN" | "CYCLING" | "SWIM" | "TRIATHLON" | "TREK" | "OTHER";

export default function CreateEventPage() {
  const r = useRouter();

  // Text fields
  const [title, setTitle] = useState("");
  const [sport, setSport] = useState<Sport>("RUN");
  const [distanceKm, setDistanceKm] = useState<string>(""); // keep as string, convert later
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [addressJson, setAddressJson] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>(""); // paise, e.g. 49900
  const [currency, setCurrency] = useState<string>("INR");
  const [capacity, setCapacity] = useState<string>("");

  // Files
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("sport", sport);
      fd.append("distanceKm", distanceKm); // empty string is OK
      fd.append("startDate", startDate);
      fd.append("endDate", endDate);
      fd.append("location", location);
      fd.append("addressJson", addressJson);
      fd.append("description", description);
      fd.append("price", price || "0");
      fd.append("currency", currency);
      fd.append("capacity", capacity);

      if (coverImageFile) fd.append("coverImage", coverImageFile);
      if (brochureFile) fd.append("brochureFile", brochureFile);

      const res = await fetch("/api/events", {
        method: "POST",
        body: fd, // IMPORTANT: no headers; browser sets multipart boundary
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Failed to create event");
        setSubmitting(false);
        return;
      }

      // Go back to list or to detail page
      r.push("/events");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Create Event</h1>

      {error && (
        <pre className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </pre>
      )}

      <form onSubmit={onSubmit} encType="multipart/form-data" className="space-y-4">
        <input
          className="w-full rounded border p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select
          className="w-full rounded border p-2"
          value={sport}
          onChange={(e) => setSport(e.target.value as Sport)}
        >
          <option>RUN</option>
          <option>CYCLING</option>
          <option>SWIM</option>
          <option>TRIATHLON</option>
          <option>TREK</option>
          <option>OTHER</option>
        </select>

        <input
          className="w-full rounded border p-2"
          placeholder="Distance (km) e.g. 21.1"
          value={distanceKm}
          onChange={(e) => setDistanceKm(e.target.value)}
          inputMode="decimal"
        />

        <input
          className="w-full rounded border p-2"
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <input
          className="w-full rounded border p-2"
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Location (city, country)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <input
          className="w-full rounded border p-2"
          placeholder='Address JSON (optional) e.g. {"line1":"..."}'
          value={addressJson}
          onChange={(e) => setAddressJson(e.target.value)}
        />

        <textarea
          className="h-28 w-full rounded border p-2"
          placeholder="Description (min 5 chars)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Files */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Cover image (JPG/PNG ≤ 2MB)
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setCoverImageFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Brochure (PDF, optional, ≤ 2MB)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setBrochureFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input
            className="rounded border p-2"
            placeholder="Price (in paise, e.g. 49900)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="numeric"
          />
          <input
            className="rounded border p-2"
            placeholder="INR"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
          <input
            className="rounded border p-2"
            placeholder="Capacity (optional)"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            inputMode="numeric"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
