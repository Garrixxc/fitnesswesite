"use client";

import { useEffect, useState } from "react";

export default function Progress({ pct }: { pct: number }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    // animate to new pct
    const id = requestAnimationFrame(() => setVal(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="w-44">
      <div className="mb-1 flex items-center justify-between text-xs text-white/60">
        <span>Profile complete</span>
        <span>{val}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-2 rounded-full transition-[width] duration-700 ease-out
                     bg-[linear-gradient(90deg,#34d399,#60a5fa)]
                     relative after:absolute after:inset-0 after:bg-white/40 after:animate-pulse after:opacity-0"
          style={{ width: `${val}%` }}
        />
      </div>
    </div>
  );
}
