import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lazily initialize the Supabase client so module evaluation does not throw during
// Next.js prerender/build when env vars are absent in that environment.
let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (and restart the dev server).'
    );
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Backwards-compatible default export: behaves like a Supabase client but only
// initializes when actually used. This avoids throwing at import time.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = getSupabaseClient() as any;
    return client[prop];
  },
}) as SupabaseClient;
