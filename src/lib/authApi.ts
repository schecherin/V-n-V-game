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
 * @returns Throws if sign-in fails.
 */
export async function signInAnonymously() {
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
}
