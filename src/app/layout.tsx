import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";

// Syne es la tipografía oficial de Roxier
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
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
      <body>{children}</body>
    </html>
  );
}
