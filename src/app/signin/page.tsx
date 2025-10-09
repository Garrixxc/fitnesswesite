"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">Sign in</h1>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="mb-4 w-full rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15"
      >
        Continue with Google
      </button>

      <div className="my-4 h-px bg-white/10" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn("credentials", {
            email,
            password,
            callbackUrl: "/",
          });
        }}
        className="space-y-3"
      >
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        <button className="w-full rounded-xl bg-primary/60 px-3 py-2 text-white hover:bg-primary/70">
          Sign in with email
        </button>
      </form>
    </main>
  );
}
