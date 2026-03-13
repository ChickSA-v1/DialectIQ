import type { Metadata } from "next";
import { Zain } from "next/font/google";
import "./globals.css";

const zain = Zain({
  variable: "--font-zain",
  subsets: ["latin", "arabic"],
  weight: ["200", "300", "400", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "DialectIQ — Dashboard",
  description:
    "Saudi dialect-aware sentiment analysis dashboard for Google Business reviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${zain.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
