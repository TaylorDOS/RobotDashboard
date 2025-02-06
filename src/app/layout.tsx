import type { Metadata } from "next";
import "./globals.css";
import { Open_Sans } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers"; // ✅ Use Providers

const openSans = Open_Sans({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-openSans",
});

export const metadata: Metadata = {
  title: "Robot Dashboard",
  description: "Capstone Group S38",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} antialiased`}>
        <Navbar />
        <Providers> {/* ✅ Wrap the app inside Providers.tsx */}
          {children}
        </Providers>
        <Footer />
      </body>
    </html>
  );
}