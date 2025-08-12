// src/lib/auth.ts
export type SessionUser = { id: string; role: "USER" | "ORGANIZER" | "ADMIN" } | null;

/**
 * DEV helper:
 * - Reads user id/role from headers (X-User-Id / X-User-Role) OR cookies.
 * - Replace with real NextAuth (getServerSession) when you’re ready.
 */
export async function getSessionUser(req: Request): Promise<SessionUser> {
  // 1) From headers (handy in dev / Postman)
  const h = new Headers(req.headers);
  const id = h.get("x-user-id") ?? undefined;
  const role = (h.get("x-user-role") as SessionUser["role"]) ?? undefined;
  if (id && role && ["USER", "ORGANIZER", "ADMIN"].includes(role)) {
    return { id, role };
  }

  // 2) From cookies (if you’re setting them somewhere else)
  try {
    const cookie = h.get("cookie") || "";
    const idMatch = cookie.match(/userId=([^;]+)/)?.[1];
    const roleMatch = cookie.match(/userRole=([^;]+)/)?.[1] as SessionUser["role"] | undefined;
    if (idMatch && roleMatch && ["USER", "ORGANIZER", "ADMIN"].includes(roleMatch)) {
      return { id: idMatch, role: roleMatch };
    }
  } catch {}

  // 3) No auth
  return null;
}

/** Common guard: only ADMIN or the event organizer can manage */
export function canManageEvent(user: SessionUser, organizerId: string) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return user.id === organizerId;
}
