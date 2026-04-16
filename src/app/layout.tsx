import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://citamejor.vercel.app"),
  title: {
    default: "BarberBook — Reserva tu cita en segundos",
    template: "%s | BarberBook",
  },
  description:
    "Plataforma de reservas para barberías en Colombia. Agenda tu corte sin llamar, en segundos. Pago de depósito opcional, recordatorios por WhatsApp.",
  keywords: [
    "barbería",
    "reservas",
    "citas",
    "Colombia",
    "Bogotá",
    "corte de cabello",
    "barba",
    "fade",
    "barbero",
  ],
  authors: [{ name: "BarberBook" }],
  openGraph: {
    type: "website",
    locale: "es_CO",
    title: "BarberBook — Reserva tu cita en segundos",
    description:
      "Encuentra tu barbería favorita y agenda tu cita en segundos. Sin llamadas, sin esperas.",
    siteName: "BarberBook",
    images: [
      {
        url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=630&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "BarberBook — Reservas para barberías",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BarberBook — Reserva tu cita en segundos",
    description:
      "Encuentra tu barbería favorita y agenda tu cita en segundos.",
    images: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=630&fit=crop&q=80",
    ],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
