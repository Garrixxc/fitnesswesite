import "@/styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FitnessHub",
  description: "India’s home for running & fitness",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-[rgb(9,15,25)] text-white antialiased">
        {/* Header */}
        <header className="border-b border-white/10 bg-[rgb(9,15,25)]/70 backdrop-blur supports-[backdrop-filter]:bg-[rgb(9,15,25)]/60">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            {/* Logo goes Home */}
            <Link href="/" className="inline-flex items-center gap-2">
              {/* Simple text or swap for an <Image> logo */}
              <span className="text-lg font-extrabold tracking-tight">FitnessHub</span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/events" className="text-sm text-white/80 hover:text-white">Events</Link>
              <Link href="/training" className="text-sm text-white/80 hover:text-white">Training</Link>
              <Link href="/experts" className="text-sm text-white/80 hover:text-white">Experts</Link>
              <Link href="/clubs" className="text-sm text-white/80 hover:text-white">Clubs</Link>
            </nav>
          </div>
        </header>

        {/* Page */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 text-sm text-white/70 sm:grid-cols-4">
            <div>
              <div className="font-semibold text-white">Sport hubs</div>
              <ul className="mt-2 space-y-1">
                <li><Link href="/sport/running" className="hover:text-white">Running</Link></li>
                <li><Link href="/sport/cycling" className="hover:text-white">Cycling</Link></li>
                <li><Link href="/sport/swimming" className="hover:text-white">Swimming</Link></li>
                <li><Link href="/sport/triathlon" className="hover:text-white">Triathlon</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white">Training</div>
              <ul className="mt-2 space-y-1">
                <li><Link href="/training" className="hover:text-white">Plans</Link></li>
                <li><Link href="/articles" className="hover:text-white">Articles</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white">Experts</div>
              <ul className="mt-2 space-y-1">
                <li><Link href="/experts/physios" className="hover:text-white">Physiotherapists</Link></li>
                <li><Link href="/experts/nutritionists" className="hover:text-white">Nutritionists</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white">Company</div>
              <ul className="mt-2 space-y-1">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-white/60">
              © {new Date().getFullYear()} FitnessHub. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
