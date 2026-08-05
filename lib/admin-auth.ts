import { getChatGPTUser, type ChatGPTUser } from "../app/chatgpt-auth";

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

export async function getAuthorizedAdmin(): Promise<ChatGPTUser | null> {
  const user = await getChatGPTUser();
  return user && isAdminEmail(user.email) ? user : null;
}

export function hasConfiguredAdmin(): boolean {
  return configuredAdminEmails().size > 0;
}
