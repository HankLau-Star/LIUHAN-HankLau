async function getRuntimeEnv() {
  const runtime = await import("cloudflare:workers");
  return runtime.env;
}

export async function getMediaBucket(): Promise<R2Bucket> {
  const runtimeEnv = await getRuntimeEnv();
  if (!runtimeEnv.MEDIA) {
    throw new Error("Cloudflare R2 binding `MEDIA` is unavailable.");
  }
  return runtimeEnv.MEDIA as R2Bucket;
}

export function mediaBindingUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return message.includes("binding `MEDIA`") || message.includes("R2 binding");
}
