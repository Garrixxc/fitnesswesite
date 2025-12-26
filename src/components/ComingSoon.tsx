import Link from "next/link";

export default function ComingSoon({ title, sub }: { title: string; sub: string }) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--brand-surface))] px-6 text-center text-white">
            <div className="h-20 w-20 rounded-full bg-white/10 mb-6 flex items-center justify-center">
                <span className="text-3xl">🚀</span>
            </div>
            <h1 className="text-4xl font-extrabold md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-lg text-lg text-white/70">{sub}</p>
            <div className="mt-8">
                <Link
                    href="/"
                    className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                >
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
