type HeaderReader = Pick<Headers, "get">;

type AccessPayload = {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  nbf?: number;
  type?: string;
};

type AccessKeySet = { keys?: JsonWebKey[] };

let cachedKeys: { expiresAt: number; keys: JsonWebKey[] } | null = null;

function accessTeamDomain(): string {
  return (process.env.CF_ACCESS_TEAM_DOMAIN ?? "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

function configuredAudiences(): Set<string> {
  return new Set(
    (process.env.CF_ACCESS_AUDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = atob(padded);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

function decodeJson<T>(value: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
  } catch {
    return null;
  }
}

async function accessSigningKeys(domain: string): Promise<JsonWebKey[]> {
  if (cachedKeys && cachedKeys.expiresAt > Date.now()) return cachedKeys.keys;

  const response = await fetch(`https://${domain}/cdn-cgi/access/certs`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return [];

  const payload = (await response.json()) as AccessKeySet;
  const keys = Array.isArray(payload.keys) ? payload.keys : [];
  cachedKeys = { keys, expiresAt: Date.now() + 5 * 60 * 1000 };
  return keys;
}

function audienceAllowed(value: string | string[] | undefined, configured: Set<string>): boolean {
  const audiences = Array.isArray(value) ? value : value ? [value] : [];
  return audiences.some((audience) => configured.has(audience));
}

export async function verifiedCloudflareAccessEmail(headers: HeaderReader): Promise<string | null> {
  const domain = accessTeamDomain();
  const audiences = configuredAudiences();
  const token = headers.get("cf-access-jwt-assertion");
  const forwardedEmail = headers.get("cf-access-authenticated-user-email")?.trim().toLowerCase();

  if (!domain || audiences.size === 0 || !token || !forwardedEmail) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const header = decodeJson<{ alg?: string; kid?: string }>(parts[0]);
  const payload = decodeJson<AccessPayload>(parts[1]);
  if (!header?.kid || header.alg !== "RS256" || !payload?.email) return null;

  const now = Math.floor(Date.now() / 1000);
  if ((payload.exp ?? 0) <= now - 30 || (payload.nbf ?? 0) > now + 30) return null;
  if (payload.iss !== `https://${domain}` || payload.type !== "app") return null;
  if (!audienceAllowed(payload.aud, audiences)) return null;
  if (payload.email.trim().toLowerCase() !== forwardedEmail) return null;

  try {
    const keys = await accessSigningKeys(domain);
    const jwk = keys.find((key) => key.kid === header.kid);
    if (!jwk) return null;

    const publicKey = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    return valid ? forwardedEmail : null;
  } catch {
    return null;
  }
}
