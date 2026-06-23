import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QA Automation Accelerator",
  description: "A focused QA automation foundation tool."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
