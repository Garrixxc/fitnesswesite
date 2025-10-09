"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "./actions";

type Props = {
  initial: {
    name: string; phone: string; city: string; state: string; country: string;
    dob: Date | null; gender: string; bloodGroup: string; tshirtSize: string;
    emergencyName: string; emergencyPhone: string; medicalNotes: string;
  };
};

export default function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [glow, setGlow] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // bind the server action so we can refresh + toast
  async function action(formData: FormData) {
    const res = await saveProfile(formData);
    if (res?.ok) {
      setToast("Saved!");
      setGlow(true);
      startTransition(() => router.refresh());
      setTimeout(() => setGlow(false), 800);
      setTimeout(() => setToast(null), 1200);
    } else {
      setToast(res?.error || "Failed to save");
      setTimeout(() => setToast(null), 2000);
    }
  }

  return (
    <div className={`relative rounded-xl ${glow ? "ring-2 ring-emerald-400/40" : ""}`}>
      <form
        ref={formRef}
        action={action}
        method="post"
        className="space-y-4"
        encType="application/x-www-form-urlencoded"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-white/60">Full name</label>
            <input name="name" defaultValue={initial.name} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90"/>
          </div>
          <div>
            <label className="block text-xs text-white/60">Phone</label>
            <input name="phone" defaultValue={initial.phone} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90"/>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-white/60">City</label>
            <input name="city" defaultValue={initial.city} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90"/>
          </div>
          <div>
            <label className="block text-xs text-white/60">State</label>
            <input name="state" defaultValue={initial.state} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90"/>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-white/60">Country</label>
            <input name="country" defaultValue={initial.country} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90"/>
          </div>
          <div>
            <label className="block text-xs text-white/60">Date of birth</label>
            <input
              type="date"
              name="dob"
              defaultValue={initial.dob ? new Date(initial.dob).toISOString().slice(0, 10) : ""}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs text-white/60">Gender</label>
            <select name="gender" defaultValue={initial.gender} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90">
              <option value="MALE">Male</option><option value="FEMALE">Female</option>
              <option value="OTHER">Other</option><option value="NA">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/60">Blood group</label>
            <select name="bloodGroup" defaultValue={initial.bloodGroup} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90">
              <option>A_POS</option><option>A_NEG</option><option>B_POS</option><option>B_NEG</option>
              <option>O_POS</option><option>O_NEG</option><option>AB_POS</option><option>AB_NEG</option><option>UNKNOWN</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/60">T-shirt size</label>
            <select name="tshirtSize" defaultValue={initial.tshirtSize} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90">
              <option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-white/60">Emergency contact name</label>
            <input name="emergencyName" defaultValue={initial.emergencyName} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90"/>
          </div>
          <div>
            <label className="block text-xs text-white/60">Emergency phone</label>
            <input name="emergencyPhone" defaultValue={initial.emergencyPhone} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90"/>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/60">Medical notes</label>
          <textarea name="medicalNotes" defaultValue={initial.medicalNotes} rows={4} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/90"/>
        </div>

        <button type="submit" className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15">
          Save changes
        </button>
      </form>

      {toast && (
        <div className="pointer-events-none absolute -top-3 right-0 translate-y-[-100%] rounded-lg bg-emerald-500/90 px-3 py-1 text-xs font-medium text-white shadow-lg animate-[toast_.9s_ease-out]">
          {toast}
        </div>
      )}

      <style jsx>{`
        @keyframes toast {
          0% { opacity: 0; transform: translateY(-8px) }
          20% { opacity: 1; transform: translateY(0) }
          80% { opacity: 1; transform: translateY(0) }
          100% { opacity: 0; transform: translateY(-8px) }
        }
      `}</style>
    </div>
  );
}
