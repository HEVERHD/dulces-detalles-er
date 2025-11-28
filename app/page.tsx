import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Dulces Detalles ER 🎁 | Arreglos y regalos personalizados en Cartagena",
  description:
    "Arreglos con chocolates, flores, peluches, tazas y detalles personalizados para cumpleaños, aniversarios, novenas y ocasiones especiales en Cartagena. Pedidos por WhatsApp al Outlet del Bosque y Supercentro Los Ejecutivos.",
  metadataBase: new URL("https://www.dulcesdetallescartagenaer.com"),
  alternates: {
    canonical: "https://www.dulcesdetallescartagenaer.com",
  },
  openGraph: {
    title: "Dulces Detalles ER 🎁 | Regala emociones, endulza momentos",
    description:
      "Detalles listos para regalar: combos navideños, cajas sorpresa, desayunos, arreglos con chocolates y más. Entrega en Cartagena y pedidos por WhatsApp.",
    url: "https://www.dulcesdetallescartagenaer.com/",
    siteName: "Dulces Detalles ER",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: "/images/og/dulces-detalles-er-og.jpg",
        width: 1200,
        height: 630,
        alt: "Arreglos y detalles de Dulces Detalles ER en Cartagena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dulces Detalles ER 🎁 | Arreglos y regalos personalizados",
    description:
      "Regala emociones con arreglos personalizados en Cartagena. Pedidos fáciles por WhatsApp.",
    images: ["/images/og/dulces-detalles-er-og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    <>
      <HomePageClient />

      {/* JSON-LD LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "Dulces Detalles ER",
            image: "https://www.dulcesdetallescartagenaer.com/images/products/navidad.png",
            "@id": "https://www.dulcesdetallescartagenaer.com/",
            url: "https://www.dulcesdetallescartagenaer.com/",
            telephone: "+57 350 473 7628",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Cartagena de Indias",
              addressRegion: "Bolívar",
              addressCountry: "CO",
            },
            department: [
              {
                "@type": "Store",
                name: "Outlet del Bosque",
                telephone: "+57 350 473 7628",
              },
              {
                "@type": "Store",
                name: "Supercentro Los Ejecutivos",
                telephone: "+57 320 230 4977",
              },
            ],
          }),
        }}
      />
    </>
  );
}
