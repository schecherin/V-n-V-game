import { supabase } from "@/lib/supabase/client";

/**
 * Get the currently authenticated user from Supabase.
 * @returns The user object if authenticated.
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Sign in anonymously using Supabase auth.
 * @returns The user object after signing in.
 */
export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
}
