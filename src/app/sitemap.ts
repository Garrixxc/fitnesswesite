import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";



export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitnesshub.com";

    // Static safe routes only (No DB calls at build time)
    return [
        "",
        "/events",
        "/signin",
        "/register",
        "/about",
        "/contact"
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
    }));
}
