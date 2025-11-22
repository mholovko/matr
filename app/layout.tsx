import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageToggle } from "@/components/navigation/page-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatR - Building Log",
  description: "Retrofit Pilot - No. 33 Link Road",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="relative h-screen w-screen overflow-hidden flex flex-col">
          {/* Header */}
          <header className="absolute top-0 left-0 z-10 w-full p-4 flex justify-between items-center bg-gradient-to-b from-white/80 to-transparent pointer-events-none">
            <h1 className="text-2xl font-bold text-slate-900 pointer-events-auto">
              Retrofit Pilot <span className="text-slate-500 text-sm font-normal">No. 33 Link Road</span>
            </h1>
          </header>

          {/* Navigation Toggle */}
          <PageToggle />

          {/* Main Content Area */}
          <div className="flex-1 flex relative z-0 overflow-hidden">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
