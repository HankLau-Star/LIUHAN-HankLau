import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ascender-archive-01.valid-gnat-7482.chatgpt.site";
const description = "跨界数字创作者的个人档案：在个人、社会与自然三个世界中持续升级，向外创造。";

export const metadata: Metadata = {
  title: "LIUHAN · HankLau｜独自升级，向外创造",
  description,
  openGraph: {
    title: "LIUHAN · HankLau｜独自升级，向外创造",
    description,
    images: [{ url: `${siteUrl}/og-v2.png`, width: 1728, height: 910, alt: "LIUHAN / HankLau 觉醒主题个人网站" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LIUHAN · HankLau｜独自升级，向外创造",
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
