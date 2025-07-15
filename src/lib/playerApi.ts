import { supabase } from './supabase/client';

export async function getPlayerById(playerId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();
  if (error) throw error;
  return data;
}