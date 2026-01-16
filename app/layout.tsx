import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import { ConditionalHeader } from "@/components/features/navigation/ConditionalHeader";
import "./globals.css";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mulish",
});

export const metadata: Metadata = {
  title: "Afrolink Cup 2026",
  description: "Turnierplattform für den Afrolink Cup 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${mulish.variable} font-sans antialiased`}>
        <ConditionalHeader />
        {children}
      </body>
    </html>
  );
}

