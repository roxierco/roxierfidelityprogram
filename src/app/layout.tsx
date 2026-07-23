import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import "./globals.css";

const syne = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Roxier Fidelity — Tarjetas de lealtad digitales",
  description:
    "Crea tarjetas de lealtad digitales para tu negocio. Sin apps, directo en Apple Wallet y Google Wallet. Un servicio de Roxier Co.",
  openGraph: {
    title: "Roxier Fidelity",
    description: "Tarjetas de lealtad digitales para tu negocio.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX" className={syne.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
