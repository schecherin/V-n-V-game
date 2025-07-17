import { supabase } from "@/lib/supabase/client";
import { Player, PlayerData } from "@/types";

export async function getPlayerById(playerId: string) {
  const playerQuery = supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single();

  const { data, error } = await playerQuery;
  if (error) throw error;
  const player: Player = data;
  return player;
}

export async function getPlayersByGameId(gameId: string) {
  const playersQuery = supabase
    .from("players")
    .select("*")
    .eq("game_id", gameId);

  const { data, error } = await playersQuery;
  if (error) throw error;
  const players: Player[] = data;
  return players;
}

export async function createPlayer(playerData: any) {
  const { data, error } = await supabase
    .from("players")
    .insert(playerData)
    .select()
    .single();
  if (error) throw error;
  return data;
}
