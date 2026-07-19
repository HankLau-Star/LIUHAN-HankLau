import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASCENDER｜个人、社会与自然",
  description: "跨界数字创作者的个人档案：个人实力与背书、输入与输出，以及对社会世界和自然世界的持续探索。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
