import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import PWAUpdater from "@/components/PWAUpdater";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eventi Comunali",
  description: "Scopri gli eventi organizzati dal comune e dalle associazioni locali",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eventi Comunali",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

async function getUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return null

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    return profile as User | null
  } catch {
    return null
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser()

  return (
    <html lang="it">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <AuthProvider initialUser={user}>
          <PWAUpdater />
          <Navbar />
          <main className="pb-20 md:pb-0">{children}</main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
