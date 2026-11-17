// Server-only: throttles abusable endpoints using Supabase (see public.rate_limit_hit).
import { createHmac } from "node:crypto";
import { getAdmin } from "@/lib/supabase/admin";

/** The caller's IP as Vercel reports it. */
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/**
 * A keyed hash, so the rate-limit table never holds a raw IP address (it's
 * personal data, and we only need to tell repeat attempts apart for a day).
 */
function pseudonym(value: string) {
  const key = process.env.SUPABASE_SECRET_KEY ?? "tynitales";
  return createHmac("sha256", key).update(`rate:${value}`).digest("base64url").slice(0, 22);
}

/**
 * One attempt at `action` by `who` (an IP or user id): false once they've
 * made `max` in the last `windowSeconds`. If the limiter itself fails (say the
 * table isn't set up yet), the attempt is allowed: better than locking people out.
 */
export async function allow(action: string, who: string, windowSeconds: number, max: number) {
  try {
    const { data, error } = await getAdmin().rpc("rate_limit_hit", {
      p_key: `${action}:${pseudonym(who)}`,
      p_window_seconds: windowSeconds,
      p_max: max,
    });
    if (error) throw error;
    return data !== false;
  } catch (e) {
    console.warn("[rate-limit] unavailable, allowing", action, (e as Error).message);
    return true;
  }
}
