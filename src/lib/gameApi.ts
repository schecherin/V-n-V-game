import { supabase } from './supabase/client';

export async function getGameById(gameId: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();
  if (error) throw error;
  return data;
}

export async function createGame(gameData: any) {
  const { data, error } = await supabase
    .from('games')
    .insert([gameData])
    .single();
  if (error) throw error;
  return data;
}

// Add more functions as needed