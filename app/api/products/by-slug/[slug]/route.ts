import { NextRequest, NextResponse } from "next/server";
// importa aquí lo que uses para buscar el producto

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    if (!slug) {
        return NextResponse.json({ error: "Slug requerido" }, { status: 400 });
    }

    // tu lógica de búsqueda
    //   const product = await getProductBySlug(slug); // ejemplo

    //   if (!product) {
    //     return NextResponse.json(
    //       { error: "Producto no encontrado" },
    //       { status: 404 }
    //     );
    //   }

    //   return NextResponse.json(product);
}
