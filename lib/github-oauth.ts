type HeaderReader = Pick<Headers, "get">;

type GitHubUser = {
  avatar_url?: string;
  id?: number;
  login?: string;
  name?: string | null;
};

type SessionPayload = {
  displayName: string;
  email: string;
  exp: number;
  githubId: number;
  iat: number;
  login: string;
  version: 1;
};

export type GitHubAdminSession = Pick<SessionPayload, "displayName" | "email" | "githubId" | "login">;

const encoder = new TextEncoder();
const SESSION_COOKIE = "hl_admin_session";
const STATE_COOKIE = "hl_github_oauth_state";
const RETURN_COOKIE = "hl_github_oauth_return";
const AUTH_COOKIE_PATH = "/api/auth/github";
const SESSION_MAX_AGE = 12 * 60 * 60;
const OAUTH_MAX_AGE = 10 * 60;

function configuredAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function configuredAdminLogins(): Set<string> {
  return new Set(
    (process.env.ADMIN_GITHUB_LOGINS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

function oauthClientId(): string {
  return (process.env.GITHUB_OAUTH_CLIENT_ID ?? "").trim();
}

function oauthClientSecret(): string {
  return (process.env.GITHUB_OAUTH_CLIENT_SECRET ?? "").trim();
}

function sessionSecret(): string {
  return (process.env.SESSION_SECRET ?? "").trim();
}

export function githubOAuthConfigured(): boolean {
  return Boolean(
    oauthClientId() &&
      oauthClientSecret() &&
      sessionSecret().length >= 32 &&
      configuredAdminEmails().length > 0 &&
      configuredAdminLogins().size > 0,
  );
}

export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin";

  try {
    const url = new URL(value, "https://portfolio.local");
    if (url.origin !== "https://portfolio.local") return "/admin";
    if (url.pathname.startsWith(AUTH_COOKIE_PATH)) return "/admin";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/admin";
  }
}

function parseCookies(headers: HeaderReader): Map<string, string> {
  const entries = (headers.get("cookie") ?? "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf("=");
      if (separator < 0) return [entry, ""] as const;
      return [entry.slice(0, separator), decodeURIComponent(entry.slice(separator + 1))] as const;
    });
  return new Map(entries);
}

function cookie(name: string, value: string, maxAge: number, path = "/"): string {
  return `${name}=${encodeURIComponent(value)}; Path=${path}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie(name: string, path = "/"): string {
  return cookie(name, "", 0, path);
}

function redirectResponse(location: string | URL): Response {
  return new Response(null, { status: 302, headers: { Location: location.toString() } });
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmacKey(): Promise<CryptoKey | null> {
  const secret = sessionSecret();
  if (secret.length < 32) return null;
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signedSession(payload: SessionPayload): Promise<string | null> {
  const key = await hmacKey();
  if (!key) return null;
  const encoded = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(encoded));
  return `${encoded}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifiedSession(value: string): Promise<SessionPayload | null> {
  const [encoded, signature, extra] = value.split(".");
  if (!encoded || !signature || extra) return null;
  const key = await hmacKey();
  if (!key) return null;

  try {
    const signatureBytes = base64UrlDecode(signature);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes.buffer.slice(signatureBytes.byteOffset, signatureBytes.byteOffset + signatureBytes.byteLength) as ArrayBuffer,
      encoder.encode(encoded),
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encoded))) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.version !== 1 || payload.exp <= now || payload.iat > now + 30) return null;
    if (!Number.isInteger(payload.githubId) || !configuredAdminLogins().has(payload.login.toLowerCase())) return null;
    if (!configuredAdminEmails().includes(payload.email.toLowerCase())) return null;
    return payload;
  } catch {
    return null;
  }
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let mismatch = 0;
  for (let index = 0; index < leftBytes.length; index += 1) mismatch |= leftBytes[index] ^ rightBytes[index];
  return mismatch === 0;
}

function randomToken(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
}

export function githubSignInPath(returnTo: string): string {
  return `/api/auth/github/start?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`;
}

export function githubSignOutPath(returnTo = "/"): string {
  return `/api/auth/github/logout?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`;
}

export async function verifiedGitHubSession(headers: HeaderReader): Promise<GitHubAdminSession | null> {
  const raw = parseCookies(headers).get(SESSION_COOKIE);
  if (!raw || !githubOAuthConfigured()) return null;
  const session = await verifiedSession(raw);
  return session
    ? { displayName: session.displayName, email: session.email, githubId: session.githubId, login: session.login }
    : null;
}

export function beginGitHubOAuth(request: Request): Response {
  if (!githubOAuthConfigured()) {
    return new Response("GitHub 后台登录尚未完成配置。", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const requestUrl = new URL(request.url);
  const state = randomToken();
  const returnTo = safeReturnPath(requestUrl.searchParams.get("returnTo"));
  const callback = new URL("/api/auth/github/callback", request.url).toString();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", oauthClientId());
  authorize.searchParams.set("redirect_uri", callback);
  authorize.searchParams.set("scope", "read:user");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("allow_signup", "false");

  const response = redirectResponse(authorize);
  response.headers.append("Set-Cookie", cookie(STATE_COOKIE, state, OAUTH_MAX_AGE, AUTH_COOKIE_PATH));
  response.headers.append("Set-Cookie", cookie(RETURN_COOKIE, returnTo, OAUTH_MAX_AGE, AUTH_COOKIE_PATH));
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

async function exchangeOAuthCode(code: string, callback: string): Promise<string | null> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: oauthClientId(),
      client_secret: oauthClientSecret(),
      code,
      redirect_uri: callback,
    }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { access_token?: string; token_type?: string };
  return payload.token_type?.toLowerCase() === "bearer" && payload.access_token ? payload.access_token : null;
}

async function fetchGitHubUser(accessToken: string): Promise<GitHubUser | null> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "LIUHAN-HankLau-Portfolio",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) return null;
  return (await response.json()) as GitHubUser;
}

function clearedOAuthRedirect(request: Request, returnTo: string): Response {
  const response = redirectResponse(new URL(safeReturnPath(returnTo), request.url));
  response.headers.append("Set-Cookie", clearCookie(STATE_COOKIE, AUTH_COOKIE_PATH));
  response.headers.append("Set-Cookie", clearCookie(RETURN_COOKIE, AUTH_COOKIE_PATH));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function finishGitHubOAuth(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const cookies = parseCookies(request.headers);
  const state = url.searchParams.get("state") ?? "";
  const expectedState = cookies.get(STATE_COOKIE) ?? "";
  const returnTo = cookies.get(RETURN_COOKIE) ?? "/admin";
  const code = url.searchParams.get("code") ?? "";

  if (!githubOAuthConfigured() || !code || !state || !expectedState || !constantTimeEqual(state, expectedState)) {
    return clearedOAuthRedirect(request, "/admin?auth=invalid");
  }

  const callback = new URL("/api/auth/github/callback", request.url).toString();
  const accessToken = await exchangeOAuthCode(code, callback);
  const githubUser = accessToken ? await fetchGitHubUser(accessToken) : null;
  const login = githubUser?.login?.trim() ?? "";
  if (!githubUser?.id || !login || !configuredAdminLogins().has(login.toLowerCase())) {
    return clearedOAuthRedirect(request, "/admin?auth=denied");
  }

  const now = Math.floor(Date.now() / 1000);
  const session = await signedSession({
    version: 1,
    githubId: githubUser.id,
    login,
    displayName: githubUser.name?.trim() || login,
    email: configuredAdminEmails()[0],
    iat: now,
    exp: now + SESSION_MAX_AGE,
  });
  if (!session) return clearedOAuthRedirect(request, "/admin?auth=unavailable");

  const response = clearedOAuthRedirect(request, returnTo);
  response.headers.append("Set-Cookie", cookie(SESSION_COOKIE, session, SESSION_MAX_AGE));
  return response;
}

export function endGitHubSession(request: Request): Response {
  const returnTo = safeReturnPath(new URL(request.url).searchParams.get("returnTo") ?? "/");
  const response = redirectResponse(new URL(returnTo, request.url));
  response.headers.append("Set-Cookie", clearCookie(SESSION_COOKIE));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
