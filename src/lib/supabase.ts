 import { createClient } from "@supabase/supabase-js";
 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing backend environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_PUBLISHABLE_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);