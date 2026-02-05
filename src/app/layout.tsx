import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vault Janitor - Destiny 2 God Roll Checker",
  description:
    "Analyze your Destiny 2 vault and inventory to find duplicate weapons. Cross-references community god rolls to tell you which duplicates are safe to dismantle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-gray-200 min-h-screen">
        {children}
      </body>
    </html>
  );
}
