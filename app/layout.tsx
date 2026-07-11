import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASCENDER 01｜跨界数字创作者",
  description: "211 科班底色，3D 视觉、AI 探索、内容增长与社群领导力构成的一人军团。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
