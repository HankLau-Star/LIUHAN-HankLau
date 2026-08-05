import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "ascender-archive-01.valid-gnat-7482.chatgpt.site";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;
  const description = "跨界数字创作者的个人档案：在个人、社会与自然三个世界中持续升级，向外创造。";
  return {
    title: "ASCENDER｜独自升级，向外创造",
    description,
    openGraph: {
      title: "ASCENDER｜独自升级，向外创造",
      description,
      images: [{ url: `${origin}/og.png`, width: 1729, height: 910, alt: "ASCENDER 觉醒主题个人网站" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "ASCENDER｜独自升级，向外创造",
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
