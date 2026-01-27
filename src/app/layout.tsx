import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eventi Comunali",
  description: "Scopri gli eventi organizzati dal comune e dalle associazioni locali",
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
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
