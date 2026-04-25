import type { Metadata } from "next";
import { GameProvider } from "@/store/game-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 人生重开手帐",
  description: "AI 驱动的人生模拟文字游戏 —— 每一局都像读了一篇短篇小说",
  keywords: ["人生重开模拟器", "AI游戏", "文字游戏", "人生模拟", "AIGC"],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "AI 人生重开手帐",
    description: "AI 驱动的人生模拟文字游戏",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-full antialiased" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif" }}>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
