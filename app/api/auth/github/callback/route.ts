import { finishGitHubOAuth } from "../../../../../lib/github-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return finishGitHubOAuth(request);
}
