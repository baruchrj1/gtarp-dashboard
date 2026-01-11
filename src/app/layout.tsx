import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/context/ThemeContext";
import TopNavigation from "@/components/TopNavigation";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { GlobalSearch } from "@/components/GlobalSearch";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-bank-gothic",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GTA-RP Dashboard | Sistema de Denúncias",
    template: "%s | GTA-RP Dashboard",
  },
  description: "Sistema profissional de gerenciamento de denúncias e administração para servidores GTA-RP. Monitore, avalie e gerencie denúncias com eficiência.",
  keywords: ["GTA-RP", "Dashboard", "Denúncias", "Administração", "Servidor", "Roleplay", "Gerenciamento"],
  authors: [{ name: "GTA-RP Team" }],
  creator: "GTA-RP Team",
  publisher: "GTA-RP",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    title: "GTA-RP Dashboard | Sistema de Denúncias",
    description: "Sistema profissional de gerenciamento de denúncias para servidores GTA-RP",
    siteName: "GTA-RP Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "GTA-RP Dashboard",
    description: "Sistema de gerenciamento de denúncias",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GTA-RP Dashboard',
  },
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
          <ThemeProvider>
            <ServiceWorkerRegistration />
            <GlobalSearch />
            <TopNavigation />
            <main className="flex-1 p-6 relative">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/noise.svg')] mix-blend-overlay"></div>
              {children}
            </main>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
