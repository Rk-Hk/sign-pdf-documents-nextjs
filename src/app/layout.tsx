import type { Metadata, Viewport } from "next";
import { EB_Garamond, Lato } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#1e3a8a",
};

export const metadata: Metadata = {
  title: "Sign Documents - Firma PDFs de forma segura y privada",
  description:
    "Firma tus documentos PDF de manera 100% privada. Todo el procesamiento ocurre en tu navegador, sin enviar datos a servidores.",
  keywords: [
    "firma digital",
    "PDF",
    "privacidad",
    "firma documentos",
    "seguridad",
  ],
  authors: [{ name: "Sign Documents" }],
  openGraph: {
    title: "Sign Documents - Firma PDFs de forma segura",
    description: "Procesamiento 100% privado en tu navegador",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sign Documents",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${lato.variable} ${ebGaramond.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
