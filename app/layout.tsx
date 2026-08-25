import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StrongHub Gym",
  description: "StrongHub Gym - Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
