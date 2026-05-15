import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Only initialise Supabase when both credentials are present and look valid.
// An invalid URL passed to createClient throws at module-load time and crashes
// the entire React tree before any component renders (blank screen).
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null; // Supabase not configured — image uploads will be unavailable.
  }

  try {
    // Validate the URL before passing it to createClient.
    new URL(supabaseUrl);
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch {
    console.warn(
      "[Supabase] Invalid REACT_APP_SUPABASE_URL:",
      supabaseUrl,
      "— file uploads disabled."
    );
    return null;
  }
}

export const supabase = createSupabaseClient();

export function getSupabaseBucket() {
  return process.env.REACT_APP_SUPABASE_BUCKET || "server-icons";
}
