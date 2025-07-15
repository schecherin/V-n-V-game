import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";

// These env vars are exposed to the browser because of the NEXT_PUBLIC_ prefix
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!);
