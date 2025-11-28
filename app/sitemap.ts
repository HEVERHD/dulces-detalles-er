import { prisma } from "@/lib/prisma";

export default async function sitemap() {
    const products = await prisma.product.findMany();

    const productEntries = products.map((product) => ({
        url: `https://www.dulcesdetallescartagenaer.com/producto/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    return [
        {
            url: "https://www.dulcesdetallescartagenaer.com/",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
        },
        ...productEntries,
    ];
}
