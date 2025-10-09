"use client";

export default function RegisterButton() {
  return (
    <button
      className="mt-6 w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      onClick={() => alert("Registration coming soon")}
      type="button"
    >
      Register
    </button>
  );
}
