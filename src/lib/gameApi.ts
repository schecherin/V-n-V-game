import { supabase } from "./supabase/client";
import { Game } from "@/types";

export interface GameData {
  game_code: string;
}

export async function getGameById(gameId: string) {
  const gameQuery = supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  const { data, error } = await gameQuery;
  if (error) throw error;
  const game: Game = data;
  return game;
}

export async function joinGame(gameCode: string, name: string) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: game, error: roomError } = await supabase
    .from("games")
    .select("game_id")
    .eq("game_code", gameCode)
    .single();
  if (roomError) throw roomError;

  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert([
      {
        game_id: game.game_id,
        user_id: user.id,
        player_name: name,
        state: "Alive",
      },
    ])
    .single();
  if (playerError) throw playerError;

  return player;
}

export async function createGame(gameData: GameData) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const gameQuery = supabase.from("games").insert([gameData]).select().single();

  const { data, error: gameError } = await gameQuery;
  if (gameError) throw gameError;
  const game: Game = data;
  return game;
}
