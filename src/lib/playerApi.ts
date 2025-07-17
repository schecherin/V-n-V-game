import { supabase } from "@/lib/supabase/client";
import { Player, PlayerData } from "@/types";

/**
 * Fetch a player by their unique playerId.
 * @param playerId The unique player ID.
 * @returns The Player object.
 */
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
  roleName: string
) {
  const { error } = await supabase
    .from("players")
    .update({ current_role_name: roleName })
    .eq("player_id", playerId);
  if (error) throw error;
  return true;
}

/**
 * Check if the current player is the host of the game.
 * @param game The game object.
 * @param players Array of Player objects.
 * @param currentPlayerId The current player's ID.
 * @returns True if the current player is the host, false otherwise.
 */
export function isCurrentUserHost(
  game: any,
  players: any[],
  currentPlayerId: string | null
): boolean {
  if (!game || !players || !currentPlayerId) return false;
  const player = players.find((p) => p.player_id === currentPlayerId);
  return player && player.user_id === game.host_user_id;
}
