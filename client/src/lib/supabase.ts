import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let clientPromise: Promise<SupabaseClient | null> | null = null;
let appUrlPromise: Promise<string | null> | null = null;

export function getAppUrl(): Promise<string | null> {
  if (!appUrlPromise) {
    appUrlPromise = fetch("/api/auth/config", { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) return null;
        const config = await response.json();
        return typeof config.appUrl === "string" ? config.appUrl.replace(/\/$/, "") : null;
      })
      .catch(() => null);
  }
  return appUrlPromise;
}

export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const response = await fetch("/api/auth/config", { cache: "force-cache" });
      if (!response.ok) return null;
      const { supabaseUrl, supabaseAnonKey } = await response.json();
      if (!supabaseUrl || !supabaseAnonKey) return null;
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });
    })().catch((error) => {
      console.error("Unable to initialize Supabase Auth", error);
      return null;
    });
  }
  return clientPromise;
}
