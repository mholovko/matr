import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageToggle } from "@/components/navigation/page-toggle";
import { LayoutScene } from "@/components/canvas/layout-scene";
import { ErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatR - Retrofit Pilot",
  description: "Material Register - No. 33 Link Road",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main className="relative h-screen w-screen overflow-hidden bg-background">

          {/* 1. Full Screen 3D Canvas */}
          <div className="absolute inset-0 z-0">
            <LayoutScene />
          </div>

          {/* 2. Floating Header Elements */}

          {/* Logo - Top Left - Clean/Minimalist (No Panel) */}
          <div className="absolute top-6 left-6 z-50 pointer-events-auto select-none mix-blend-multiply dark:mix-blend-normal">
            <h1 className="flex items-baseline gap-3 text-foreground">
              {/* Brand */}
              <span className="text-xl font-bold tracking-tight">MatR</span>

              {/* Divider */}
              <span className="text-foreground/20 font-light text-lg">/</span>

              {/* Context */}
              <div className="flex flex-col leading-none">
                <span className="text-sm font-semibold text-foreground/90">Retrofit Pilot</span>
                <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  No. 33 Link Road
                </span>
              </div>
            </h1>
          </div>

          {/* Navigation - Top Center Floating */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <PageToggle />
          </div>

          {/* 3. Main UI Overlay (Panels) */}
          <div className="absolute inset-0 z-10 pointer-events-none [&>*]:pointer-events-auto">

            {children}

          </div>

        </main>
      </body>
    </html>
  );
}