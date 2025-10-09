import Link from "next/link";
import { auth, signOut } from "@/auth"; // v5 helpers

export default async function HeaderUser() {
  const session = await auth(); // server-side helper

  if (!session?.user) {
    return (
      <Link
        href="/signin"
        className="rounded bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
      >
        Sign in
      </Link>
    );
  }

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <form action={doSignOut} className="flex items-center gap-3">
      {/* Greeting */}
      <span className="text-white/80">
        Hi, {session.user.name ?? session.user.email}
      </span>

      {/* Profile Button */}
      <Link
        href="/profile"
        className="rounded bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
      >
        Profile
      </Link>

      {/* Sign out */}
      <button
        className="rounded bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
