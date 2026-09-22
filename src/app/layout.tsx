import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suyanka App Template | Full-Stack Agent-Powered Starter",
  description:
    "Production-ready Next.js 14 application template governed by 27 modular agent skills, defensive engineering standards, and anti-AI design protocols.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-background text-slate-100 antialiased selection:bg-accent-sky selection:text-black">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
