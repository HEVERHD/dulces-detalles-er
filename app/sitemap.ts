// app/sitemap.ts
import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://www.dulcesdetallescartagenaer.com";

    // Slugs de categorías (los mismos que usas en el front)
    const categories = [
        "cumple",
        "aniversario",
        "declaracion",
        "infantil",
        "dietetico",
    ];

    // Productos desde la BD
    const products = await prisma.product.findMany({
        select: {
            slug: true,
            updatedAt: true,
        },
    });

    // 👇 OJO: usamos "as const" para que changeFrequency sea un literal y no string
    const categoryEntries = categories.map<MetadataRoute.Sitemap[number]>((slug) => ({
        url: `${baseUrl}/categoria/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    const productEntries = products.map<MetadataRoute.Sitemap[number]>((p) => ({
        url: `${baseUrl}/producto/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "daily" as const,
        priority: 0.9,
    }));

    return [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 1.0,
        },
        ...categoryEntries,
        ...productEntries,
    ];
}
// app/sitemap.ts