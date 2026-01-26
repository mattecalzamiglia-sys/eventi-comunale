import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eventi Comunali",
  description: "Scopri gli eventi organizzati dal comune e dalle associazioni locali",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
