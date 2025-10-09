import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: Request) {
  const session = await auth();
  const url = new URL(req.url);
  const protectedPaths = ["/checkout", "/account"];

  if (protectedPaths.some((p) => url.pathname.startsWith(p)) && !session?.user) {
    url.pathname = "/signin";
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// match all subpaths of /checkout and /account
export const config = {
  matcher: ["/checkout/:path*", "/account/:path*"],
};
