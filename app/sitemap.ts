// app/sitemap.ts
import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://www.dulcesdetallescartagenaer.com";

    const categories = [
        "cumple",
        "aniversario",
        "declaracion",
        "infantil",
        "dietetico",
    ];

    // Home y categorías (siempre)
    const staticEntries: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        ...categories.map<MetadataRoute.Sitemap[number]>((slug) => ({
            url: `${baseUrl}/categoria/${slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        })),
    ];

    // 👇 Si no hay DATABASE_URL, devolvemos solo lo estático
    if (!process.env.DATABASE_URL) {
        console.warn(
            "[sitemap] DATABASE_URL no está definida. Se genera sitemap solo con home y categorías."
        );
        return staticEntries;
    }

    // 👇 Si SÍ hay DATABASE_URL, intentamos traer productos
    let productEntries: MetadataRoute.Sitemap[number][] = [];

    try {
        const products = await prisma.product.findMany({
            select: {
                slug: true,
                updatedAt: true,
            },
        });

        productEntries = products.map<MetadataRoute.Sitemap[number]>((p) => ({
            url: `${baseUrl}/producto/${p.slug}`,
            lastModified: new Date(p.updatedAt),
            changeFrequency: "daily",
            priority: 0.9,
        }));
    } catch (err) {
        console.error("[sitemap] Error cargando productos para el sitemap:", err);
    }

    return [...staticEntries, ...productEntries];
}
