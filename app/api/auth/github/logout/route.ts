import { endGitHubSession } from "../../../../../lib/github-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return endGitHubSession(request);
}
