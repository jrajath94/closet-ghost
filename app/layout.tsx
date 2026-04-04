import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Closet Ghost | AI Fashion Haunt",
  description: "A centuries-old fashion ghost judges your outfit and transforms your style using AI",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👻</text></svg>" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
