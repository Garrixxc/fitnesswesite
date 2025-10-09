// src/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
// If you keep magic-link email later, re-enable it:
// import Email from "next-auth/providers/nodemailer";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    // Email({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST!,
    //     port: Number(process.env.EMAIL_SERVER_PORT!),
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER!,
    //       pass: process.env.EMAIL_SERVER_PASSWORD!,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM!,
    // }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,

  callbacks: {
    /**
     * Put our Prisma user id into the token (token.uid)
     * and keep name/image up to date.
     */
    async jwt({ token, trigger, session, account, profile }) {
      // On first sign in or whenever we have an email, ensure user exists in our DB.
      if (token?.email) {
        const email = token.email.toLowerCase();

        // Upsert user in our Prisma schema
        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {
            // allow profile refresh to flow into our DB
            name:
              (trigger === "update" ? session?.user?.name : token.name) ??
              undefined,
            image:
              (trigger === "update" ? session?.user?.image : token.picture) ??
              undefined,
          },
          create: {
            email,
            name: token.name ?? "",
            image: token.picture ?? null,
            // role defaults to USER by schema; nothing else required
          },
        });

        // Stash our Prisma user id on the token.
        // (Do NOT rely on token.sub when you don't use a NextAuth adapter.)
        (token as any).uid = dbUser.id;
        token.name = dbUser.name ?? token.name;
        token.picture = dbUser.image ?? token.picture;
      }

      // If the session was explicitly updated from the client,
      // mirror those fields to the token so the upsert above can pick them next time
      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.picture = (session.user as any).image ?? token.picture;
      }

      return token;
    },

    /**
     * Expose our Prisma id on the session as session.user.id
     */
    async session({ session, token }) {
      // Ensure user object exists
      session.user = session.user || ({} as any);

      (session.user as any).id = (token as any).uid ?? token.sub ?? null;
      session.user.name = token.name ?? session.user.name ?? null;
      // next-auth v5 puts the picture on token.picture
      (session.user as any).image = (token as any).picture ?? (session.user as any).image ?? null;

      return session;
    },
  },

  pages: {
    signIn: "/signin", // optional nice route you already have
  },
});
