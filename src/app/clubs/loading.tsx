export default function Loading() {
  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="h-7 w-40 animate-pulse rounded bg-white/[0.08]" />
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="aspect-[16/9] w-full animate-pulse bg-white/[0.06]" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.08]" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-white/[0.06]" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
