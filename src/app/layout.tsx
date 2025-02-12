import type { Metadata } from "next";
import "./globals.css";
import { Open_Sans } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";

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
        
        <Providers>
        <Navbar />
          {children}
        </Providers>
        <Footer />
      </body>
    </html>
  );
}