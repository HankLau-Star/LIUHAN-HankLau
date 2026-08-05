import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

async function getRuntimeEnv() {
  const runtime = await import("cloudflare:workers");
  return runtime.env;
}

export async function getD1() {
  const runtimeEnv = await getRuntimeEnv();
  if (!runtimeEnv.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }

  return runtimeEnv.DB;
}

export async function getDb() {
  const d1 = await getD1();

  return drizzle(d1, { schema });
}
