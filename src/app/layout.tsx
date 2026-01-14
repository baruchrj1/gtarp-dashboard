import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/context/ThemeContext";
import { getTenantFromRequest } from "@/lib/tenant";

export const dynamic = "force-dynamic";

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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// Metadata dinamica baseada no tenant - MANTÉM, pois metadata sobe
export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantFromRequest();

  const siteName = tenant?.name || "GTA-RP Dashboard";
  const description = tenant
    ? `Sistema de denúncias - ${tenant.name}`
    : "Sistema profissional de gerenciamento de denúncias para servidores GTA-RP";

  return {
    title: {
      default: `${siteName} | Sistema de Denúncias`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: ["GTA-RP", "Dashboard", "Denúncias", "Administração", "Servidor", "Roleplay"],
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: "/",
      title: `${siteName} | Sistema de Denúncias`,
      description,
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: siteName,
    },
    icons: tenant?.favicon ? { icon: tenant.favicon } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // O RootLayout agora é apenas o Shell global.
  // A UI do Tenant (TopNav, Padding) foi movida para (tenant)/layout.tsx
  // A UI do Master (Sidebar) está em master/layout.tsx

  return (
    <html
      lang="pt-BR"
      className="dark scroll-smooth"
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Global Head Scripts if any */}
      </head>
      <body className={`${inter.variable} ${oswald.variable} bg-background font-sans min-h-screen flex flex-col`}>
        <Providers>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
