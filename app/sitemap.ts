import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://www.dulcesdetallescartagenaer.com";

    // Obtener categorías
    const categories = [
        "cumple",
        "aniversario",
        "declaracion",
        "infantil",
        "dietetico",
    ];

    // Obtener productos desde tu base de datos
    const products = await prisma.product.findMany({
        select: {
            slug: true,
            updatedAt: true,
        },
    });

    const categoryEntries = categories.map((slug) => ({
        url: `${baseUrl}/categoria/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const productEntries = products.map((p) => ({
        url: `${baseUrl}/producto/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "daily",
        priority: 0.9,
    }));

    return [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        ...categoryEntries,
        ...productEntries,
    ];
}
