"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initial: {
    name: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    gender: string; // enum string
    tshirtSize: string; // enum string
    bloodGroup: string; // enum string
    dob: string; // yyyy-mm-dd
    emergencyName: string;
    emergencyPhone: string;
    medicalNotes: string;
    phoneVerifiedAt?: string;
    aadhaarStatus: string;
  };
};

export default function ProfileForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [pending, start] = useTransition();
  const r = useRouter();

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await fetch("/api/account/profile", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(form),
          });
          const j = await res.json();
          if (!res.ok) {
            alert(j.error ?? "Failed to save");
          } else {
            r.refresh();
            alert("Saved!");
          }
        });
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <Field label="Name">
        <input className="inp" value={form.name} onChange={(e) => update("name", e.target.value)} />
      </Field>

      <Field label="Phone">
        <div className="flex gap-2">
          <input className="inp flex-1" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91..." />
          <button
            type="button"
            className="rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white"
            onClick={async () => {
              const res = await fetch("/api/account/otp/request", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ destination: form.phone, purpose: "PHONE_VERIFY" }),
              });
              const j = await res.json();
              if (!res.ok) alert(j.error ?? "Failed to send OTP");
              else alert("OTP sent (check server console in dev).");
            }}
          >
            Send OTP
          </button>
        </div>
        {initial.phoneVerifiedAt ? (
          <p className="mt-1 text-xs text-emerald-300">Verified</p>
        ) : (
          <div className="mt-2 flex gap-2">
            <input className="inp flex-1" placeholder="Enter 6-digit code" id="otp" />
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white"
              onClick={async () => {
                const code = (document.getElementById("otp") as HTMLInputElement)?.value.trim();
                if (!code) return alert("Enter code");
                const res = await fetch("/api/account/otp/verify", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ destination: form.phone, code }),
                });
                const j = await res.json();
                if (!res.ok) alert(j.error ?? "Failed to verify");
                else {
                  alert("Phone verified!");
                  location.reload();
                }
              }}
            >
              Verify
            </button>
          </div>
        )}
      </Field>

      <Field label="Date of birth">
        <input className="inp" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
      </Field>

      <Field label="City">
        <input className="inp" value={form.city} onChange={(e) => update("city", e.target.value)} />
      </Field>

      <Field label="State">
        <input className="inp" value={form.state} onChange={(e) => update("state", e.target.value)} />
      </Field>

      <Field label="Country">
        <input className="inp" value={form.country} onChange={(e) => update("country", e.target.value)} />
      </Field>

      <Field label="Gender">
        <select className="inp" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
          <option>NA</option>
          <option>MALE</option>
          <option>FEMALE</option>
          <option>OTHER</option>
        </select>
      </Field>

      <Field label="T-shirt size">
        <select className="inp" value={form.tshirtSize} onChange={(e) => update("tshirtSize", e.target.value)}>
          <option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
        </select>
      </Field>

      <Field label="Blood group">
        <select className="inp" value={form.bloodGroup} onChange={(e) => update("bloodGroup", e.target.value)}>
          <option>UNKNOWN</option>
          <option>A_POS</option><option>A_NEG</option>
          <option>B_POS</option><option>B_NEG</option>
          <option>O_POS</option><option>O_NEG</option>
          <option>AB_POS</option><option>AB_NEG</option>
        </select>
      </Field>

      <Field label="Emergency contact name">
        <input className="inp" value={form.emergencyName} onChange={(e) => update("emergencyName", e.target.value)} />
      </Field>

      <Field label="Emergency contact phone">
        <input className="inp" value={form.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} />
      </Field>

      <div className="sm:col-span-2">
        <label className="block text-[11px] font-medium text-white/60">Medical notes</label>
        <textarea
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
          rows={4}
          value={form.medicalNotes}
          onChange={(e) => update("medicalNotes", e.target.value)}
        />
      </div>

      <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-2">
        <button
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>

      <style jsx global>{`
        .inp {
          @apply mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-white/60">{label}</label>
      {children}
    </div>
  );
}
