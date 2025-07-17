import { supabase } from "@/lib/supabase/client";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function signInAnonymously() {
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
}
