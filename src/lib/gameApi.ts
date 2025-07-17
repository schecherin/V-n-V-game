import { supabase } from "@/lib/supabase/client";
import { Game, GameData, GamePhase } from "@/types";

export async function getGameById(gameId: string) {
  const gameQuery = supabase
    .from("games")
    .select("*")
    .eq("game_id", gameId)
    .single();

  const { data, error } = await gameQuery;
  if (error) throw error;
  const game: Game = data;
  return game;
}

export async function getGameByCode(gameCode: string) {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("game_code", gameCode)
    .single();

  if (error) throw error;
  return data as Game;
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
        user_id: user.id,
        game_code: gameCode,
        player_name: name,
        state: "Alive",
      },
    ])
    .single();
  if (playerError) throw playerError;

  return player;
}

export async function generateGameCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function checkGameCodeUnique(gameCode: string) {
  const { data: existingGame, error: checkError } = await supabase
    .from("games")
    .select("game_code")
    .eq("game_code", gameCode)
    .single();
  if (checkError && checkError.code === "PGRST116") {
    return true; // Unique
  } else if (!checkError) {
    return false; // Not unique
  } else {
    throw checkError;
  }
}

export async function createGame(gameData: GameData) {
  const { data, error } = await supabase
    .from("games")
    .insert(gameData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getGameByCodeAndPhase(
  gameCode: string,
  phase: GamePhase
) {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("game_code", gameCode)
    .eq("current_phase", phase)
    .single();
  if (error || !data) throw error || new Error("Game not found");
  return data;
}

export async function updateGamePlayerCount(gameId: string, newCount: number) {
  const { error } = await supabase
    .from("games")
    .update({ current_player_count: newCount })
    .eq("game_code", gameId);
  if (error) throw error;
}
