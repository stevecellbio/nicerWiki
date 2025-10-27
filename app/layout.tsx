import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeInitializer from "@/components/ThemeInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "nicer.wiki - beautiful wikipedia reader",
  description: "a beautiful, distraction-free interface for reading wikipedia articles with enhanced readability and customizable themes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
