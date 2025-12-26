import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: Request) {
  // Middleware logic
  const session = await auth();
  const url = new URL(req.url);
  const protectedPaths = ["/checkout", "/account"];

  // Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (protectedPaths.some((p) => url.pathname.startsWith(p)) && !session?.user) {
    url.pathname = "/signin";
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  return response;
}

// match all subpaths of /checkout and /account
export const config = {
  matcher: ["/checkout/:path*", "/account/:path*"],
};
