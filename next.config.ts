import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "LIUHAN-HankLau";
const pagesBasePath = `/${repositoryName}`;

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? pagesBasePath : undefined,
  assetPrefix: isGitHubPages ? pagesBasePath : undefined,
  images: { unoptimized: true },
  experimental: isGitHubPages ? { workerThreads: true, cpus: 1 } : undefined,
  typescript: { ignoreBuildErrors: isGitHubPages },
};

export default nextConfig;
