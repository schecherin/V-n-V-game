import { supabase } from "@/lib/supabase/client";
import { Game, GameData, GamePhase } from "@/types";

/**
 * Fetch a game by its unique game_id.
 * @param gameId The unique game_id of the game.
 * @returns The Game object.
 */
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

/**
 * Fetch a game by its game_code.
 * @param gameCode The code of the game.
 * @returns The Game object.
 */
export async function getGameByCode(gameCode: string) {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("game_code", gameCode)
    .single();

  if (error) throw error;
  return data as Game;
}

/**
 * Join a game as a player by game code and player name.
 * @param gameCode The code of the game to join.
 * @param name The name of the player joining.
 * @returns The created player object.
 */
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

/**
 * Generate a random 6-character game code.
 * @returns A unique game code string.
 */
export async function generateGameCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Check if a game code is unique (not already used).
 * @param gameCode The game code to check.
 * @returns True if unique, false otherwise.
 */
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

/**
 * Create a new game with the provided data.
 * @param gameData The data for the new game.
 * @returns The created Game object.
 */
export async function createGame(gameData: GameData) {
  const { data, error } = await supabase
    .from("games")
    .insert(gameData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch a game by code and phase.
 * @param gameCode The code of the game.
 * @param phase The phase to match.
 * @returns The Game object.
 */
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

/**
 * Update the player count for a game.
 * @param gameId The game code.
 * @param newCount The new player count.
 */
export async function updateGamePlayerCount(gameId: string, newCount: number) {
  const { error } = await supabase
    .from("games")
    .update({ current_player_count: newCount })
    .eq("game_code", gameId);
  if (error) throw error;
}

/**
 * Update the current phase of a game.
 * @param gameCode The game code.
 * @param newPhase The new phase to set.
 */
export async function updateGamePhase(gameCode: string, newPhase: GamePhase) {
  const { error } = await supabase
    .from("games")
    .update({ current_phase: newPhase })
    .eq("game_code", gameCode);
  if (error) throw error;
}

/**
 * Fetch all roles that can be assigned randomly.
 * @returns An array of assignable roles.
 */
export async function getAssignableRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("can_be_assigned_randomly", true);
  if (error) throw error;
  return data;
}
