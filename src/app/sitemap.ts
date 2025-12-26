import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitnesshub.com";

    // Static pages
    const routes = [
        "",
        "/events",
        "/signin",
        "/register",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
    }));

    // Dynamic Events
    const events = await prisma.event.findMany({
        select: {
            slug: true,
            updatedAt: true,
        },
        take: 1000,
    });

    const eventRoutes = events.map((event) => ({
        url: `${baseUrl}/events/${event.slug}`,
        lastModified: event.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [...routes, ...eventRoutes];
}
