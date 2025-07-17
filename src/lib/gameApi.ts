import { supabase } from "./supabase/client";
import { QueryData } from "@supabase/supabase-js";

export async function getGameById(gameId: string) {
  const gameQuery = supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();
  type Game = QueryData<typeof gameQuery>;

  const { data, error } = await gameQuery;
  if (error) throw error;
  const game: Game = data;
  return game;
}

interface GameData {
  game_code: string;
}
export async function createGame(gameData: GameData) {
  const gameQuery = supabase.from("games").insert([gameData]).select().single();
  type Game = QueryData<typeof gameQuery>;

  const { data, error } = await gameQuery;
  if (error) throw error;
  const game: Game = data;
  return game;
}
