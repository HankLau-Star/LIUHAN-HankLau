import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../app/chatgpt-auth";
import { verifiedCloudflareAccessEmail } from "./cloudflare-access";
import { githubSignInPath, githubSignOutPath, verifiedGitHubSession } from "./github-oauth";

export type AdminUser = {
  displayName: string;
  email: string;
  provider: "chatgpt" | "cloudflare-access" | "github";
};

function configuredAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string): boolean {
  return configuredAdminEmails().has(email.trim().toLowerCase());
}

export function isCloudflareAccessMode(): boolean {
  return process.env.AUTH_PROVIDER === "cloudflare-access";
}

export function isGitHubOAuthMode(): boolean {
  return process.env.AUTH_PROVIDER === "github";
}

export async function getAdminUser(): Promise<AdminUser | null> {
  if (isGitHubOAuthMode()) {
    const requestHeaders = await headers();
    const session = await verifiedGitHubSession(requestHeaders);
    return session
      ? { displayName: session.displayName, email: session.email, provider: "github" }
      : null;
  }

  if (isCloudflareAccessMode()) {
    const requestHeaders = await headers();
    const email = await verifiedCloudflareAccessEmail(requestHeaders);
    return email
      ? { displayName: email.split("@")[0] || email, email, provider: "cloudflare-access" }
      : null;
  }

  const user = await getChatGPTUser();
  return user ? { displayName: user.displayName, email: user.email, provider: "chatgpt" } : null;
}

export async function requireAdminUser(returnTo: string): Promise<AdminUser | null> {
  const user = await getAdminUser();
  if (user || isCloudflareAccessMode()) return user;
  if (isGitHubOAuthMode()) redirect(githubSignInPath(returnTo));
  redirect(chatGPTSignInPath(returnTo));
}

export function adminSignInPath(returnTo = "/admin"): string {
  if (isGitHubOAuthMode()) return githubSignInPath(returnTo);
  if (isCloudflareAccessMode()) return returnTo;
  return chatGPTSignInPath(returnTo);
}

export function adminSignOutPath(user: AdminUser, returnTo = "/"): string {
  if (user.provider === "github") return githubSignOutPath(returnTo);
  return user.provider === "cloudflare-access" ? "/cdn-cgi/access/logout" : chatGPTSignOutPath(returnTo);
}

export async function getAuthorizedAdmin(): Promise<AdminUser | null> {
  const user = await getAdminUser();
  return user && isAdminEmail(user.email) ? user : null;
}

export function hasConfiguredAdmin(): boolean {
  return configuredAdminEmails().size > 0;
}
