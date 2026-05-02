import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studyhub",
  description: "A virtual study space — work together, stay motivated.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-amber-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
