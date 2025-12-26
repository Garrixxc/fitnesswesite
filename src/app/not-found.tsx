import Link from "next/link";

// [CRITICAL] Not Found pages in App Router are server components by default.
// To ensure they don't crash during static build:
// 1. Do NOT access headers(), cookies(), or searchParams at the top level.
// 2. Do NOT run async side-effects (DB queries) at the top level.

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--brand-surface))] px-6 py-12 text-center text-white">
            <h2 className="text-4xl font-extrabold tracking-tight">404</h2>
            <p className="mt-4 text-lg text-white/70">This page could not be found.</p>
            <Link
                href="/"
                className="mt-8 rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15"
            >
                Return Home
            </Link>
        </main>
    );
}
