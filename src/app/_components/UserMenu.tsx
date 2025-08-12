"use client";

import Link from "next/link";
import { useState } from "react";

export default function UserMenu() {
  // Stub: replace with next-auth session later.
  const [user, setUser] = useState<null | { name: string; username?: string }>(null);

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/auth/signin" className="text-sm font-medium hover:underline">Sign in</Link>
        <Link href="/auth/signup" className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-black/90">
          Sign up
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-gray-900 text-white grid place-items-center text-xs font-bold">
        {initials}
      </div>
      <div className="text-sm">
        <div className="font-semibold">{user.name}</div>
        {user.username && <div className="text-gray-500">@{user.username}</div>}
      </div>
    </div>
  );
}
