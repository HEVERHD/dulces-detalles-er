import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_LIST = [
    "cumpleanos",
    "aniversarios",
    "declaraciones",
    "infantil",
    "bebes",
    "dietetico",
    "amor-amistad",
    "romantico",
    "sorpresas",
    "globos",
    "flores",
    "premium",
    "regalos-personalizados",
    "dulces",
    "especiales",
];

function slugify(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

async function main() {
    console.log("🔥 Eliminando datos previos...");
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log("📦 Creando categorías...");

    const categories = [];

    for (const name of CATEGORY_LIST) {
        const category = await prisma.category.create({
            data: {
                slug: slugify(name),
                name: name
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                description: faker.lorem.sentence(),
            },
        });

        categories.push(category);
    }

    console.log(`✅ ${categories.length} categorías creadas`);

    console.log("🎁 Creando 150 productos falsos...");

    for (let i = 0; i < 150; i++) {
        const category = faker.helpers.arrayElement(categories);
        const name = faker.commerce.productName() + " " + faker.word.adjective();
        const slug = slugify(name);

        await prisma.product.create({
            data: {
                slug,
                name,
                shortDescription: faker.commerce.productDescription(),
                description:
                    faker.lorem.paragraph() +
                    "\n\nEste detalle incluye decoración especial y empaques personalizados 🎀",
                price: faker.number.int({ min: 25000, max: 250000 }),
                tag: faker.helpers.arrayElement([
                    "Más vendido",
                    "Ideal para cumpleaños",
                    "Amor & amistad",
                    "Premium",
                    "Edición especial",
                    null,
                ]),
                image: `https://picsum.photos/seed/${slug}/600/600`,
                isFeatured: faker.datatype.boolean(),
                isActive: true,
                categoryId: category.id,
            },
        });

        if ((i + 1) % 25 === 0) {
            console.log(`→ ${i + 1} productos insertados`);
        }
    }

    console.log("🎉 SEED COMPLETADO CON ÉXITO — lista tu base en Neon");
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
