import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let clientPromise: Promise<SupabaseClient | null> | null = null;

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
