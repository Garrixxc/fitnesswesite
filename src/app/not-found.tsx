export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
            <h2 className="text-4xl font-extrabold tracking-tight">404</h2>
            <p className="mt-4 text-lg text-white/70">
                This page could not be found.
            </p>
            <Link
                href="/"
                className="mt-8 rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold"
            >
                Return Home
            </Link>
        </main>
    );
}
