import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Timer",
  description: "Pomodoro & Study Log App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-200">

        <header className="p-4 border-b">
          <Link href="/" className="font-semibold">
            🏠 Home
          </Link>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}

