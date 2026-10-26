"use client";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

let client: SupabaseClient | null = null;

/** The one Supabase client for the browser. Sign-in is remembered on this device. */
export function getSupabase() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Supabase isn't configured: fill in .env.local and restart the dev server.");
    client = createClient(url, key, {
      auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

/** The signed-in sender: undefined while checking, null when signed out. */
export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    let supabase: SupabaseClient;
    try {
      supabase = getSupabase();
    } catch (e) {
      console.error(e);
      const id = setTimeout(() => setUser(null), 0);
      return () => clearTimeout(id);
    }
    let alive = true;
    // Waits for the client to finish any Google sign-in in the URL (?code=…).
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      stripAuthParams();
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Lets light components (the navbar avatar) refresh without loading Supabase.
      window.dispatchEvent(new Event("tynitales:auth"));
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return user;
}

/** Sends the sender to Google, then back to this exact page. */
export async function signInWithGoogle() {
  const { origin, pathname, search } = window.location;
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}${pathname}${search}` },
  });
  if (error) throw error;
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

/** The access token for calling our own API routes. */
export async function accessToken() {
  const { data } = await getSupabase().auth.getSession();
  return data.session?.access_token ?? null;
}

/** Google sends people back with ?code=…; tidy it out of the address bar. */
function stripAuthParams() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("code")) return;
  url.searchParams.delete("code");
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}
