import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ascender-archive-01.valid-gnat-7482.chatgpt.site";
const description = "LIUHAN / HankLau 的跨界数字创作档案：向内生长，向外创造。";

export const metadata: Metadata = {
  title: "ASCENDER｜LIUHAN · HankLau",
  description,
  openGraph: {
    title: "ASCENDER｜LIUHAN · HankLau",
    description,
    images: [{ url: `${siteUrl}/og-v2.png`, width: 1728, height: 910, alt: "ASCENDER · LIUHAN / HankLau 个人网站" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASCENDER｜LIUHAN · HankLau",
    description,
    images: [`${siteUrl}/og-v2.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
