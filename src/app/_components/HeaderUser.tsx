import Link from "next/link";

export default function HeaderUser() {
  // Static placeholder for build safety
  // TODO: Uncomment auth logic after successful deployment and DB connection
  /*
  const session = await auth();
  if (!session?.user) { ... }
  */

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/signin"
        className="rounded bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
      >
        Sign in
      </Link>
    </div>
  );
}
