import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "./components/Header"; // ヘッダーを別ファイルに切り出します

// PWA用の設定をサーバーサイドで定義
export const metadata: Metadata = {
  title: "Focus",
  description: "洗練された学習タイマー＆ログアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Focus",
  },
};

export const viewport: Viewport = {
  themeColor: "#2D5A78",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-[#F8FAFC] antialiased text-slate-800 font-sans">
        {/* クライアントサイドでのパス判定が必要なヘッダーのみ別コンポーネント化 */}
        <Header />
        {children}
      </body>
    </html>
  );
}