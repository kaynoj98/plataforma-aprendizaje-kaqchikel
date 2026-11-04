import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Plataforma Kaqchikel",
    template: "%s | Plataforma Kaqchikel",
  },
  description:
    "Plataforma educativa para el aprendizaje del idioma Maya Kaqchikel como segunda lengua.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-GT" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
