import { supabase } from "./supabase/client";

export async function signInIfNeeded() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) {
    supabase.auth.signInAnonymously();
  }
}
