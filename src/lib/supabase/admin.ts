import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with the secret key. It bypasses row-level
 * security, so never import this from a "use client" file.
 */
let admin: SupabaseClient | null = null;

export function getAdmin() {
  if (typeof window !== "undefined") throw new Error("getAdmin() is server-only");
  if (!admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Supabase isn't configured: fill in .env.local and restart the dev server.");
    admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return admin;
}

export const MEDIA_BUCKET = "gift-media";

/** The signed-in user behind a request's "Authorization: Bearer <token>" header. */
export async function userFromRequest(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const { data, error } = await getAdmin().auth.getUser(token);
  return error ? null : data.user;
}
