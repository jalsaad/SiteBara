import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "Athénée Royal Jules Bara — Tournai",
    template: "%s · Athénée Royal Jules Bara",
  },
  description:
    "Apprendre, s'ouvrir, s'accomplir. Au cœur de Tournai, un athénée où chaque élève est accompagné individuellement vers la réussite, dans un cadre moderne et bienveillant.",
  keywords: [
    "Athénée Royal Jules Bara",
    "école Tournai",
    "enseignement secondaire",
    "inscription école Tournai",
  ],
  openGraph: {
    title: "Athénée Royal Jules Bara — Tournai",
    description:
      "Apprendre, s'ouvrir, s'accomplir. Un enseignement de qualité au cœur de Tournai depuis 1595.",
    locale: "fr_BE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${outfit.variable}`}>
        {children}
      </body>
    </html>
  );
}
