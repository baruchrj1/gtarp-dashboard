import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-bank-gothic", weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "GTA RP Dashboard",
  description: "Official server dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${oswald.variable} bg-background font-sans min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1 p-6 relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/noise.svg')] mix-blend-overlay"></div>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
