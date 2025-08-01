import { supabase } from "@/lib/supabase/client";

export interface MinigameResult {
  playerId: string;
  playerName: string;
  rank: number;
  points: number;
  totalPoints: number;
}

export async function calculateMinigameResults(
  gameCode: string,
  dayNumber: number,
  isHost: boolean = false
): Promise<MinigameResult[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: any = {};
    if (isHost && session) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const { data, error } = await supabase.functions.invoke('calculate-minigame-results', {
      body: {
        gameCode,
        dayNumber,
        isHost
      },
      headers
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Failed to calculate results');
    
    return data.results;
  } catch (error) {
    console.error('Failed to calculate minigame results:', error);
    throw error;
  }

}
export async function fetchMinigameResults(
  gameCode: string,
  dayNumber: number,
  playerId: string
): Promise<{ results: MinigameResult[], calculated: boolean }> {
  const { data, error } = await supabase.functions.invoke('calculate-minigame-results', {
    body: {
      gameCode,
      dayNumber,
      action: 'fetch',
      playerId 
    }
  });

  if (error) throw error;
  
  return {
    results: data.results || [],
    calculated: data.calculated || false
  };

}