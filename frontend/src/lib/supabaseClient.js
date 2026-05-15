import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidConfig = (url, key) => {
  return (
    url && key && url !== "https://<project>.supabase.co" && !url.includes("<")
  );
};
export const supabase = isValidConfig(supabaseUrl, supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (console.warn(
      "Supabase config is missing or invalid.Authentication features will be compromised/disabled.",
    ),
    null);

export function getSupabaseBucket() {
  return import.meta.env.REACT_APP_SUPABASE_BUCKET || "server-icons";
}
