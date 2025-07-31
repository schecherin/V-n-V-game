import { supabase } from "@/lib/supabase/client";
import { Game, Player, PlayerData } from "@/types";

/**
 * Fetch a player by their unique playerId.
 * @param playerId The unique player ID.
 * @returns The Player object.
 */
export async function getPlayerById(playerId: string) {
  const playerQuery = supabase
    .from("players")
    .select("*")
    .eq("player_id", playerId)
    .single();

  const { data, error } = await playerQuery;
  if (error) throw error;
  const player: Player = data;
  return player;
}

/**
 * Fetch all players in a game by game code.
 * @param gameId The game code.
 * @returns An array of Player objects.
 */
export async function getPlayersByGameCode(gameId: string) {
  const playersQuery = supabase
    .from("players")
    .select("*")
    .eq("game_code", gameId);

  const { data, error } = await playersQuery;
  if (error) throw error;
  const players: Player[] = data;
  return players;
}

/**
 * Fetch a player by name in a specific game.
 * @param gameId The game code.
 * @param playerName The player's name.
 * @returns The player object or null if not found.
 */
export async function getPlayerByNameInGame(
  gameId: string,
  playerName: string
) {
  const { data, error } = await supabase
    .from("players")
    .select("player_name")
    .eq("game_code", gameId)
    .eq("player_name", playerName)
    .single();
  if (data) return data;
  if (error && error.code === "PGRST116") return null; // Not found
  if (error) throw error;
  return null;
}

/**
 * Create a new player with the provided data.
 * @param playerData The data for the new player.
 * @returns The created Player object.
 */
export async function createPlayer(playerData: PlayerData) {
  const { data, error } = await supabase
    .from("players")
    .insert(playerData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Assign a role name to a player.
 * @param playerId The player's ID.
 * @param roleName The role name to assign.
 * @returns True if successful.
 */
export async function assignRoleNameToPlayer(
  playerId: string,
  roleName: string,
  setOriginal: boolean = false
) {
  // If original_role_name is null, set both current_role_name and original_role_name
  if (setOriginal) {
    const { error } = await supabase
      .from("players")
      .update({ current_role_name: roleName, original_role_name: roleName })
      .eq("player_id", playerId);
    if (error) throw error;
    return true;
  } else {
    // Otherwise, only update current_role_name
    const { error } = await supabase
      .from("players")
      .update({ current_role_name: roleName })
      .eq("player_id", playerId);
    if (error) throw error;
    return true;
  }
}

/**
 * Check if a player currently has a specific role.
 * @param playerId The player's ID.
 * @param roleName The role name to check.
 * @returns Promise<boolean> true if the player has the role, false otherwise.
 */
export async function playerHasRole(
  playerId: string,
  roleName: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("players")
    .select("current_role_name")
    .eq("player_id", playerId)
    .single();
  if (error) throw error;
  return data?.current_role_name === roleName;
}

/**
 * Fetch a player's current personal_points.
 * @param playerId The player's ID.
 * @returns The player's current points (number).
 */
export async function fetchPlayerPoints(playerId: string): Promise<number> {
  const { data, error } = await supabase
    .from("players")
    .select("personal_points")
    .eq("player_id", playerId)
    .single();
  if (error) throw error;
  return data?.personal_points || 0;
}

/**
 * Update a player's minigame points and rank.
 * @param playerId The player's ID.
 * @param points The points to add (not set).
 * @param rank The rank to set.
 */
export async function updatePlayerMinigamePointsAndRank(
  playerId: string,
  points: number,
  rank: number
) {
  try {
    // First fetch current points
    const currentPoints = await fetchPlayerPoints(playerId);
    const newPoints = currentPoints + points;

    // Update with new points and rank
    const { data, error } = await supabase
      .from("players")
      .update({
        personal_points: newPoints,
        last_mini_game_rank: rank,
      })
      .eq("player_id", playerId)
      .select()
      .single();

    if (error) {
      console.error("Error updating player points:", error);
      throw error;
    }

    console.log(
      `Updated player ${playerId}: points ${currentPoints} -> ${newPoints}, rank: ${rank}`
    );
    return data;
  } catch (error) {
    console.error("Failed to update player minigame points and rank:", error);
    throw error;
  }
}

/**
 * Set the game code for a player.
 * @param playerId The player's ID.
 * @param gameCode The game code to set.
 * @returns The updated player data.
 */
export async function setPlayerGameCode(playerId: string, gameCode: string) {
  const { data, error } = await supabase
    .from("players")
    .update({ game_code: gameCode })
    .eq("player_id", playerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
