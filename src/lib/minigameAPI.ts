// lib/minigameApi.ts
import { supabase } from "@/lib/supabase/client";

export interface MinigameResult {
  playerId: string;
  playerName: string;
  correctGuesses: number;
  rank: number;
  points: number;
  totalPoints: number;
}

/**
 * Calculate minigame results using the edge function
 * @param gameCode The game code
 * @param dayNumber The day number
 * @returns Array of minigame results
 */
export async function calculateMinigameResults(
  gameCode: string,
  dayNumber: number
): Promise<MinigameResult[]> {
  try {
    // Get the current session token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('No active session');
    }

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('calculate-minigame-results', {
      body: {
        gameCode,
        dayNumber
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to calculate results');
    }

    return data.results;
  } catch (error) {
    console.error('Failed to calculate minigame results:', error);
    throw error;
  }
}

export async function updateMinigameResults(
  gameCode: string,
  results: MinigameResult[]
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('No active session');

  // Update each player's points
  const updates = results.map(result => 
    supabase
      .from('players')
      .update({
        personal_points: result.totalPoints,
        last_mini_game_rank: result.rank
      })
      .eq('player_id', result.playerId)
  );

  await Promise.all(updates);
}