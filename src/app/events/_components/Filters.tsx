"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const SPORTS = ["RUN", "CYCLING", "SWIM", "TRIATHLON", "TREK", "OTHER"] as const;

function setParam(url: URL, key: string, value?: string | null) {
  if (!value) {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
}

export default function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state initialised from current URL
  const [sport, setSport] = useState(searchParams.get("sport") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [price, setPrice] = useState(searchParams.get("price") ?? ""); // "", "free", "paid"

  const hasActive = useMemo(() => {
    return Boolean(
      sport || location || from || to || price
    );
  }, [sport, location, from, to, price]);

  function apply() {
    const url = new URL(window.location.href);
    setParam(url, "sport", sport || null);
    setParam(url, "location", location || null);
    setParam(url, "from", from || null);
    setParam(url, "to", to || null);
    setParam(url, "price", price || null);
    router.push(pathname + "?" + url.searchParams.toString());
  }

  function clearAll() {
    setSport("");
    setLocation("");
    setFrom("");
    setTo("");
    setPrice("");
    const url = new URL(window.location.href);
    ["sport", "location", "from", "to", "price"].forEach(k => url.searchParams.delete(k));
    router.push(pathname); // no params
  }

  return (
    <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Sport */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">Event type</span>
          <select
            value={sport}
            onChange={e => setSport(e.target.value)}
            className="rounded-md border px-3 py-2"
          >
            <option value="">All</option>
            {SPORTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        {/* Location contains */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">Location contains</span>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Mumbai"
            className="rounded-md border px-3 py-2"
          />
        </label>

        {/* From date */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">From</span>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="rounded-md border px-3 py-2"
          />
        </label>

        {/* To date */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">To</span>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="rounded-md border px-3 py-2"
          />
        </label>

        {/* Price */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">Price</span>
          <select
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="rounded-md border px-3 py-2"
          >
            <option value="">All</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={apply}
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          Apply filters
        </button>
        <button
          onClick={clearAll}
          className="rounded-md border px-4 py-2"
          disabled={!hasActive}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
