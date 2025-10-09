// src/app/profile/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Client components
import ProfileForm from "./profile-form";
import UploadIdProof from "./UploadIdProof";
import Progress from "./Progress";

export const revalidate = 0; // always fresh

// % complete—requires ID proof file present to hit 100%
function completion(p?: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  tshirtSize?: string | null;
  phone?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  idProofFilePath?: string | null; // <- gates 100%
}) {
  if (!p) return 0;
  const required = [
    p.city,
    p.state,
    p.country,
    p.gender,
    p.bloodGroup,
    p.tshirtSize,
    p.phone,
    p.emergencyName,
    p.emergencyPhone,
    p.idProofFilePath,
  ];
  const filled = required.filter(Boolean).length;
  return Math.round((filled / required.length) * 100);
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold text-white/90">No profile</h2>
        <p className="mt-2 text-white/60">
          We couldn’t find your account. Please sign in again.
        </p>
        <div className="mt-6">
          <Link
            href="/signin"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  const userId = session.user.id;

  // User + profile (note: idProofFilePath selected)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      points: true,
      athleteProfile: {
        select: {
          dob: true,
          city: true,
          state: true,
          country: true,
          gender: true,
          phone: true,
          bloodGroup: true,
          emergencyName: true,
          emergencyPhone: true,
          tshirtSize: true,
          medicalNotes: true,
          idProofType: true,
          idProofFilePath: true, // ✅ correct column
          idProofVerifiedAt: true,
        },
      },
    },
  });

  // Basic stats + recent activity
  const [totalRegs, upcomingRegs, recentRegs] = await Promise.all([
    prisma.registration.count({ where: { userId } }),
    prisma.registration.count({
      where: {
        userId,
        event: { startDate: { gte: new Date() } },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
    prisma.registration.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        event: {
          select: {
            slug: true,
            title: true,
            startDate: true,
            sport: true,
            location: true,
          },
        },
      },
    }),
  ]);

  const profile = user?.athleteProfile ?? null;
  const pct = completion(profile);

  return (
    <div className="px-6 py-10">
      {/* Header */}
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/90">
            {(user?.name ?? user?.email ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold text-white/90">
              {user?.name ?? user?.email}
            </div>
            <p className="text-sm text-white/60">
              Complete your info for smooth registrations & better recommendations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-white/80">Points</div>
            <div className="text-2xl font-semibold text-white">
              {user?.points ?? 0}
            </div>
          </div>

          {/* ✅ animated progress bar */}
          <Progress pct={pct} />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left: form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white/90">Profile details</h3>
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
              Tip: fill everything for one-click registrations
            </span>
          </div>

          <ProfileForm
            initial={{
              name: user?.name ?? "",
              phone: profile?.phone ?? "",
              city: profile?.city ?? "",
              state: profile?.state ?? "",
              country: profile?.country ?? "",
              dob: profile?.dob ? new Date(profile.dob) : null,
              gender: (profile?.gender as any) ?? "NA",
              bloodGroup: (profile?.bloodGroup as any) ?? "UNKNOWN",
              tshirtSize: (profile?.tshirtSize as any) ?? "M",
              emergencyName: profile?.emergencyName ?? "",
              emergencyPhone: profile?.emergencyPhone ?? "",
              medicalNotes: profile?.medicalNotes ?? "",
            }}
          />
        </div>

        {/* Right: ID proof + badges */}
        <div className="space-y-6">
          <UploadIdProof
            initialType={profile?.idProofType ?? null}
            verifiedAt={profile?.idProofVerifiedAt?.toISOString() ?? null}
            hasFile={Boolean(profile?.idProofFilePath)}
          />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 font-semibold text-white/90">Badges</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-white/80">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                First Registration
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                1000 Points Club
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="mx-auto mt-8 max-w-6xl">
        <h3 className="mb-3 font-semibold text-white/90">Your dashboard</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">Total registrations</div>
            <div className="mt-2 text-3xl font-semibold text-white">{totalRegs}</div>
            <p className="mt-1 text-xs text-white/60">
              Keep going, every finish line counts!
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">Upcoming events</div>
            <div className="mt-2 text-3xl font-semibold text-white">
              {upcomingRegs}
            </div>
            <p className="mt-1 text-xs text-white/60">
              Stay consistent—block your calendar.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">Points</div>
            <div className="mt-2 text-3xl font-semibold text-white">
              {user?.points ?? 0}
            </div>
            <p className="mt-1 text-xs text-white/60">
              Earn more by joining events & completing streaks.
            </p>
          </div>
        </div>
      </div>

      {/* Recent registrations */}
      <div className="mx-auto mt-8 max-w-6xl">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-medium text-white/90">Recent registrations</h4>
          <Link
            href="/events"
            className="text-sm text-white/80 hover:text-white"
          >
            Browse events ↗
          </Link>
        </div>

        {recentRegs.length === 0 ? (
          <p className="text-sm text-white/60">No registrations yet.</p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
            {recentRegs.map((r) => (
              <li key={r.id} className="flex items-center justify-between p-4">
                <div>
                  <Link
                    href={`/events/${r.event.slug}`}
                    className="text-white/90 hover:underline"
                  >
                    {r.event.title}
                  </Link>
                  <div className="text-xs text-white/60">
                    {new Date(r.event.startDate).toLocaleDateString()} •{" "}
                    {r.event.sport} • {r.event.location}
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
