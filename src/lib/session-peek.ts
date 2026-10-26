/**
 * Who's signed in, read straight from Supabase's saved session without loading
 * the Supabase library. Marketing pages use this for the avatar in the navbar,
 * so they stay light. Not a security check: only for showing a name and photo.
 */
export type PeekedUser = { name?: string; avatar?: string; email?: string };

export function peekSignedInUser(): PeekedUser | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !/^sb-.+-auth-token$/.test(key)) continue;
      const saved = JSON.parse(localStorage.getItem(key) ?? "null");
      const session = saved?.currentSession ?? saved;
      const user = session?.user;
      if (!user || !session?.refresh_token) return null;
      const meta = user.user_metadata ?? {};
      return { name: meta.full_name ?? meta.name, avatar: meta.avatar_url ?? meta.picture, email: user.email };
    }
  } catch {
    /* storage blocked */
  }
  return null;
}
