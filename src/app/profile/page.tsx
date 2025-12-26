import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export const revalidate = 0;

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      registrations: {
        include: { event: { select: { slug: true, title: true, startDate: true, coverImage: true, price: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });
  if (!user) redirect("/signin");

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
                Welcome back, {user.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-3">
        {/* Left: User Info Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Your details</h2>
            <ProfileForm
              initial={{
                name: user.name ?? "",
                phone: user.phone ?? "",
                city: user.city ?? "",
                state: user.state ?? "",
                country: user.country ?? "",
                gender: user.gender ?? "NA",
                tshirtSize: user.tshirtSize ?? "M",
                bloodGroup: user.bloodGroup ?? "UNKNOWN",
                dob: user.dob ? new Date(user.dob).toISOString().slice(0, 10) : "",
                emergencyName: user.emergencyName ?? "",
                emergencyPhone: user.emergencyPhone ?? "",
                medicalNotes: user.medicalNotes ?? "",
                aadhaarStatus: "NOT_SUBMITTED", // Mock for UI
                phoneVerifiedAt: "", // Mock
              }}
            />
          </div>
        </div>

        {/* Right: recent activity */}
        <div className="flex flex-col gap-6">
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
        </div>
      </div>
    </main>
  );
}

