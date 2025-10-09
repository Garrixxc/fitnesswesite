import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; // next-auth v5 style; if you use v4, swap to getServerSession(authOptions)
import Link from "next/link";
import ProfileForm from "././ProfileForm";
import Image from "next/image";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      athleteProfile: true,
      registrations: {
        include: { event: { select: { slug: true, title: true, startDate: true, coverImage: true, price: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });
  if (!user) redirect("/signin");

  const ledger = await prisma.pointsLedger.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const p = user.athleteProfile;

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                Your account
              </span>
              <h1 className="mt-3 text-3xl font-extrabold text-white">Profile & dashboard</h1>
              <p className="mt-1 text-sm text-white/70">
                Keep your info ready for quick race registrations. Earn points as you participate.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <div className="text-[11px] uppercase tracking-wide text-white/60">Points</div>
              <div className="text-3xl font-extrabold text-white">{user.points}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-3">
        {/* Left: profile form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Personal details</h2>
            <ProfileForm
              initial={{
                name: user.name ?? "",
                phone: p?.phone ?? "",
                city: p?.city ?? "",
                state: p?.state ?? "",
                country: p?.country ?? "",
                gender: p?.gender ?? "NA",
                tshirtSize: p?.tshirtSize ?? "M",
                bloodGroup: p?.bloodGroup ?? "UNKNOWN",
                dob: p?.dob ? new Date(p.dob).toISOString().slice(0, 10) : "",
                emergencyName: p?.emergencyName ?? "",
                emergencyPhone: p?.emergencyPhone ?? "",
                medicalNotes: p?.medicalNotes ?? "",
                phoneVerifiedAt: p?.phoneVerifiedAt ? new Date(p.phoneVerifiedAt).toISOString() : "",
                aadhaarStatus: p?.aadhaarStatus ?? "NOT_SUBMITTED",
              }}
            />
          </div>
        </div>

        {/* Right: KYC + recent activity */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="mb-3 text-sm font-semibold text-white">Identity (Aadhaar)</h3>
            <StatusPill status={(p?.aadhaarStatus ?? "NOT_SUBMITTED") as any} />
            <p className="mt-2 text-sm text-white/70">
              Aadhaar verification via OTP is coming soon. Once enabled, verified profiles get a
              badge and faster check-ins.
            </p>
            <button
              disabled
              className="mt-4 w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/70"
              title="Coming soon"
            >
              Verify Aadhaar (coming soon)
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="mb-3 text-sm font-semibold text-white">Recent registrations</h3>
            {user.registrations.length === 0 ? (
              <div className="text-sm text-white/70">
                No registrations yet. <Link className="text-primary" href="/events">Explore events →</Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {user.registrations.map((r) => (
                  <li key={r.event.slug} className="flex gap-3 rounded-lg border border-white/10 p-3">
                    <div className="relative h-16 w-24 overflow-hidden rounded">
                      <Image
                        src={r.event.coverImage || "/placeholder.jpg"}
                        alt={r.event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/events/${r.event.slug}`} className="block truncate font-medium text-white">
                        {r.event.title}
                      </Link>
                      <div className="text-xs text-white/60">
                        {new Date(r.event.startDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        · ₹{new Intl.NumberFormat("en-IN").format(r.event.price)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="mb-3 text-sm font-semibold text-white">Recent points</h3>
            {ledger.length === 0 ? (
              <div className="text-sm text-white/70">No points yet.</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {ledger.map((l) => (
                  <li key={l.id} className="flex items-center justify-between">
                    <span className="text-white/85">{l.reason}</span>
                    <span className={l.delta >= 0 ? "text-emerald-300" : "text-rose-300"}>
                      {l.delta >= 0 ? "+" : ""}
                      {l.delta}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" }) {
  const map = {
    NOT_SUBMITTED: { label: "Not submitted", cls: "bg-white/10 text-white/70" },
    PENDING: { label: "Pending", cls: "bg-amber-500/20 text-amber-200" },
    VERIFIED: { label: "Verified", cls: "bg-emerald-500/20 text-emerald-200" },
    REJECTED: { label: "Rejected", cls: "bg-rose-500/20 text-rose-200" },
  } as const;
  const v = map[status] ?? map.NOT_SUBMITTED;
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${v.cls}`}>{v.label}</span>;
}
