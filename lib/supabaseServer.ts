import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client using the service role key. Do NOT expose this key to the client.
// Lazy initialize to avoid crashing API route imports and return clearer JSON errors.
let _client: SupabaseClient | null = null;

function init(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE) as string | undefined;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE). Set it in your server env e.g. .env.local');
  }
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

export function getSupabaseServer(): SupabaseClient {
  if (_client) return _client;
  _client = init();
  return _client;
}
