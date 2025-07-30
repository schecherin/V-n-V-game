import { supabase } from "@/lib/supabase/client";
import { Game, GameData, GamePhase } from "@/types";
import { playerHasRole } from "./playerApi";
import {
  updatePlayerMinigamePointsAndRank,
  getPlayersByGameCode,
} from "@/lib/playerApi";
import {
  countCorrectGuesses,
  rankAndAssignPoints,
  MinigameResult,
} from "./gameUtils";

/**
 * Fetch a game by its unique game_id.
 * @param gameId The unique game_id of the game.
 * @returns The Game object.
 */
export async function getGameById(gameId: string) {
  const gameQuery = supabase
    .from("games")
    .select("*")
    .eq("game_code", gameId)
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
    .select("game_code")
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
 * Generate a random 5-character game code.
 * @returns A unique game code string.
 */
export async function generateGameCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 5; i++) {
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
  // check for assignable roles
  const { data, error } = await supabase
    .from("roles")
    .select()
    .eq("can_be_assigned_randomly", true);

  if (error) {
    console.error("Error fetching assignable roles:", error);
    throw error;
  }

  return data;
}

/**
 * Get the tutorial status for a game.
 * @param gameCode The game code.
 * @returns True if tutorial is enabled, false otherwise.
 */
export async function getGameTutorialStatus(
  gameCode: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("games")
    .select("tutorial")
    .eq("game_code", gameCode)
    .single();
  if (error) throw error;
  return data?.tutorial || false;
}

/**
 * Set the tutorial status for a game.
 * @param gameCode The game code.
 * @param enabled Whether tutorial should be enabled.
 */
export async function setGameTutorialStatus(
  gameCode: string,
  enabled: boolean
) {
  const { error } = await supabase
    .from("games")
    .update({ tutorial: enabled })
    .eq("game_code", gameCode);
  if (error) throw error;
}

/**
 * Get the include outreach phase status for a game.
 * @param gameCode The game code.
 * @returns True if outreach phase is included, false otherwise.
 */
export async function getGameIncludeOutreachPhase(
  gameCode: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("games")
    .select("include_outreach_phase")
    .eq("game_code", gameCode)
    .single();
  if (error) throw error;
  return data?.include_outreach_phase || false;
}

/**
 * Set the include outreach phase status for a game.
 * @param gameCode The game code.
 * @param enabled Whether outreach phase should be included.
 */
export async function setGameIncludeOutreachPhase(
  gameCode: string,
  enabled: boolean
) {
  const { error } = await supabase
    .from("games")
    .update({ include_outreach_phase: enabled })
    .eq("game_code", gameCode);
  if (error) throw error;
}

/**
 * Insert a guess into the reflection_phase_guesses table.
 * Sets is_correct based on whether the guessed player has the guessed role.
 * @param params Object containing required fields for the guess.
 * @returns The inserted guess record.
 */
export async function insertReflectionPhaseGuess({
  game_code,
  day_number,
  guessed_player_id,
  guessed_role_name,
  guessing_player_id,
}: {
  game_code: string;
  day_number: number;
  guessed_player_id: string;
  guessed_role_name: string;
  guessing_player_id: string;
}) {
  // Check if the guess is correct
  let is_correct = false;
  try {
    is_correct = await playerHasRole(guessed_player_id, guessed_role_name);
  } catch (err) {
    throw err;
    // If error, default to false
    //is_correct = false;
  }
  const { data, error } = await supabase
    .from("reflection_phase_guesses")
    .insert([
      {
        game_code,
        day_number,
        guessed_player_id,
        guessed_role_name,
        guessing_player_id,
        is_correct,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch all reflection phase guesses for a game (and optionally a specific day).
 * @param gameId The game code.
 * @param dayNumber The day number to filter by.
 * @returns Array of guesses.
 */
export async function getReflectionPhaseGuesses(
  gameId: string,
  dayNumber: number
) {
  let query = supabase
    .from("reflection_phase_guesses")
    .select("guessing_player_id, is_correct")
    .eq("game_code", gameId)
    .eq("day_number", dayNumber);
  const { data, error } = await query;
  if (error) throw error;
  return data as { guessing_player_id: string; is_correct: boolean }[];
}

export async function getMaxPoints(gameId: string) {
  const { data, error } = await supabase
    .from("games")
    .select("max_points_per_day_m")
    .eq("game_code", gameId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Calculate minigame results, assign points and rank, and update the database.
 * @param gameId The game code.
 * @returns Array of results for each player: { playerId, playerName, correctGuesses, rank, points }
 */
export async function calculateAndAssignMinigameResults(
  gameId: string,
  dayNumber: number
): Promise<MinigameResult[]> {
  // 1. Fetch all players
  const players = await getPlayersByGameCode(gameId);
  // 2. Fetch all guesses for the game and day
  const guesses = await getReflectionPhaseGuesses(gameId, dayNumber);

  // 3. Count correct guesses for each player
  const correctGuessCount = countCorrectGuesses(
    guesses,
    players as { player_id: string }[]
  );

  // 4. Build results array
  const baseResults = (players as any[]).map((player) => ({
    playerId: player.player_id,
    playerName: player.player_name,
    correctGuesses: correctGuessCount[player.player_id] || 0,
  }));

  // 5. Rank and assign points
  const results = rankAndAssignPoints(
    baseResults,
    (await getMaxPoints(gameId)).max_points_per_day_m
  );

  // 6. Update each player's points and rank in the database
  for (const r of results) {
    await updatePlayerMinigamePointsAndRank(r.playerId, r.points, r.rank);
  }

  return results;
}
