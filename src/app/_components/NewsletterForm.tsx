'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      // TODO: wire up to your email provider (Resend/Mailchimp/etc.)
      await new Promise((r) => setTimeout(r, 600));
      setMsg('Subscribed! 🎉');
      setEmail('');
    } catch {
      setMsg('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-4 flex max-w-md gap-2" onSubmit={onSubmit}>
      <input
        type="email"
        required
        placeholder="you@example.com"
        className="flex-1 rounded-lg px-3 py-2 text-gray-900"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy}
      />
      <button
        type="submit"
        className="rounded-lg bg-white px-4 py-2 font-medium text-gray-900 hover:bg-white/90 disabled:opacity-60"
        disabled={busy}
      >
        {busy ? 'Subscribing…' : 'Subscribe'}
      </button>
      {msg && <span className="ml-2 self-center text-sm text-white">{msg}</span>}
    </form>
  );
}
