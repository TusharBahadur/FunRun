"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { accessToken, getSupabase } from "./browser";

export type Profile = {
  display_name: string | null;
  avatar_url: string | null;
  sign_off: string | null;
  created_at: string;
};

/** The signed-in sender's profile (null while loading or signed out). */
export function useProfile(user: User | null | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    getSupabase()
      .from("profiles")
      .select("display_name, avatar_url, sign_off, created_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        const meta = user.user_metadata ?? {};
        // Fall back to Google's details if the profile row isn't there yet.
        setProfile(
          (data as Profile | null) ?? {
            display_name: meta.full_name ?? meta.name ?? null,
            avatar_url: meta.avatar_url ?? meta.picture ?? null,
            sign_off: null,
            created_at: user.created_at,
          },
        );
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const update = useCallback(
    async (patch: Partial<Pick<Profile, "sign_off">>) => {
      if (!user) return false;
      const { error } = await getSupabase()
        .from("profiles")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) return false;
      setProfile((p) => (p ? { ...p, ...patch } : p));
      return true;
    },
    [user],
  );

  return { profile, update };
}

/** Deletes the account, its uploads and its gifts. Links stop working. */
export async function deleteAccount() {
  const token = await accessToken();
  if (!token) throw new Error("Please sign in again.");
  const res = await fetch("/api/account/delete", { method: "POST", headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error ?? "Couldn't delete your account. Please try again.");
  }
  await getSupabase().auth.signOut();
}
