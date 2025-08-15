import { supabase } from "@/lib/supabase/client";
import {
  AbilityEffectType,
  ElectionRole,
  Game,
  GameData,
  GamePhase,
  TreasuryActionType,
  RoleTier,
} from "@/types";
import { Database } from "@/database.types";
import { playerHasRole } from "./playerApi";
import {
  updatePlayerMinigamePointsAndRank,
  getPlayersByGameCode,
  assignRoleNameToPlayer,
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
        status: "Alive",
      },
    ])
    .single();
  if (playerError) throw playerError;

  return player;
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

/**
 * Record a vote in an election.
 * @param params Object containing vote details.
 * @returns The inserted vote record.
 */
export async function recordVote({
  gameId,
  voterId,
  candidateId,
  dayNumber,
  electionRole,
  isChairmanDoubleVote,
}: {
  gameId: string;
  voterId: string;
  candidateId: string;
  dayNumber: number;
  electionRole: ElectionRole;
  isChairmanDoubleVote?: boolean;
}) {
  const { data, error } = await supabase
    .from("game_votes")
    .insert({
      game_code: gameId,
      voter_player_id: voterId,
      voted_player_id: candidateId,
      day_number: dayNumber,
      election_target_role_name: electionRole,
      is_chairman_double_vote: isChairmanDoubleVote,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get the player ID with the most votes for a specific role in an election.
 * @param gameId The game ID.
 * @param dayNumber The day number.
 * @param electionRole The election role.
 * @param voterId Optional voter ID to check if they've voted.
 * @returns The player ID with the most votes, or null if no votes exist.
 */
export async function countVotes(
  gameId: string,
  dayNumber: number,
  electionRole: ElectionRole,
  voterId?: string
): Promise<string | null> {
  let query = supabase
    .from("game_votes")
    .select("voted_player_id")
    .eq("game_code", gameId)
    .eq("day_number", dayNumber)
    .eq("election_target_role_name", electionRole);

  // If voterId is provided, filter by voterId, for checking if they've voted
  if (voterId) {
    query = query.eq("voter_player_id", voterId);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (!data || data.length === 0) {
    return null;
  }

  // Count votes for each candidate
  const voteCounts: Record<string, number> = {};
  data.forEach((vote) => {
    voteCounts[vote.voted_player_id] =
      (voteCounts[vote.voted_player_id] || 0) + 1;
  });

  // Find the player with the most votes
  let winnerId: string | null = null;
  let maxVotes = 0;

  for (const [playerId, voteCount] of Object.entries(voteCounts)) {
    if (voteCount > maxVotes) {
      maxVotes = voteCount;
      winnerId = playerId;
    }
  }

  return winnerId;
}

/**
 * Get the host player ID for a game.
 * @param gameId The game ID.
 * @returns The host player ID, or null if not set.
 */
export async function getHostPlayerId(gameId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("games")
    .select("host_player_id")
    .eq("game_code", gameId)
    .single();
  if (error) throw error;
  return data?.host_player_id || null;
}

/**
 * Set the host user ID in the games table.
 * @param gameId The game ID.
 * @param hostPlayerId The host player ID.
 */
export async function setHostPlayerId(gameId: string, hostPlayerId: string) {
  const { data, error } = await supabase
    .from("games")
    .update({ host_player_id: hostPlayerId })
    .eq("game_code", gameId)
    .select();
  if (error) throw error;
  return data;
}

/**
 * Set the secretary player ID in the games table.
 * @param gameId The game ID.
 * @param secretaryPlayerId The secretary player ID.
 */
export async function setSecretaryPlayerId(
  gameId: string,
  secretaryPlayerId: string
) {
  const { error } = await supabase
    .from("games")
    .update({ secretary_player_id: secretaryPlayerId })
    .eq("game_code", gameId);
  if (error) throw error;
}

/**
 * Set the treasurer player ID in the games table.
 * @param gameId The game ID.
 * @param treasurerPlayerId The treasurer player ID.
 */
export async function setTreasurerPlayerId(
  gameId: string,
  treasurerPlayerId: string
) {
  const { error } = await supabase
    .from("games")
    .update({ treasurer_player_id: treasurerPlayerId })
    .eq("game_code", gameId);
  if (error) throw error;
}

export async function setGameDay(gameId: string, dayNumber: number) {
  const { error } = await supabase
    .from("games")
    .update({ current_day: dayNumber })
    .eq("game_code", gameId);
  if (error) throw error;
}

export async function setTreasurerAction(
  gameId: string,
  action: TreasuryActionType,
  dayNumber: number,
  treasurerPlayerId: string,
  pointsSpent: number,
  targetPlayerId?: string,
  details?: string
) {
  const { error } = await supabase.from("treasury_transactions").insert({
    game_code: gameId,
    action_type: action,
    day_number: dayNumber,
    treasurer_player_id: treasurerPlayerId,
    points_spent: pointsSpent,
    target_player_id: targetPlayerId,
    details: details,
  });
  if (error) throw error;
}

export async function confirmTreasuryAction(transactionId: string) {
  const { error } = await supabase
    .from("treasury_transactions")
    .update({ secretary_confirmed: true })
    .eq("id", transactionId);
  if (error) throw error;
}

export async function updateGameGroupPointsPool(
  gameId: string,
  points: number
) {
  const { error } = await supabase
    .from("games")
    .update({ group_points_pool: points })
    .eq("game_code", gameId);
  if (error) throw error;
}

/**
 * Update multiple game properties at once.
 * Use this for less common updates or when updating multiple properties atomically.
 * For common operations, prefer the specific functions like updateGamePhase(), setHostPlayerId(), etc.
 *
 * @param gameCode The code of the game to update.
 * @param updates Object containing the properties to update.
 * @returns The updated Game object.
 */
export async function updateGameProperties(
  gameCode: string,
  updates: Partial<Database["public"]["Tables"]["games"]["Update"]>
) {
  const { data, error } = await supabase
    .from("games")
    .update(updates)
    .eq("game_code", gameCode)
    .select()
    .single();

  if (error) throw error;
  return data as Game;
}

/**
 * Get the treasurer actions for a game.
 * @param gameId The game ID.
 * @param dayNumber The day number.
 * @returns The treasurer actions.
 */
export async function getGameTreasurerActions(
  gameId: string,
  dayNumber: number
) {
  const { data, error } = await supabase
    .from("treasury_transactions")
    .select("*")
    .eq("game_code", gameId)
    .eq("day_number", dayNumber);
  if (error) throw error;
  return data;
}

/**
 * Insert a vote announcement into the vote_announcements table.
 * @param gameId The game ID.
 * @param dayNumber The day number.
 * @param hostId The host player ID.
 * @param secretaryId The secretary player ID.
 * @param imprisonedPlayerId The imprisoned player ID.
 * @param isTruthful Whether the host is truthful
 */
export async function insertVoteAnnouncement(
  gameId: string,
  dayNumber: number,
  hostId: string,
  secretaryId: string,
  imprisonedPlayerId: string,
  isTruthful: boolean
) {
  const { error } = await supabase.from("vote_announcements").insert({
    game_code: gameId,
    day_number: dayNumber,
    host_player_id: hostId,
    imprisoned_player_id: imprisonedPlayerId,
    secretary_player_id: secretaryId,
    host_is_truthful: isTruthful,
  });
  if (error) throw error;
}

/**
 * Assess a vote announcement.
 * @param gameId The game ID.
 * @param dayNumber The day number.
 * @param secretaryConfirmed Whether the secretary has confirmed the announcement.
 */
export async function assessVoteAnnouncement(
  gameId: string,
  dayNumber: number,
  secretaryConfirmed: boolean
) {
  const { error } = await supabase
    .from("vote_announcements")
    .update({ secretary_confirmed: secretaryConfirmed })
    .eq("game_code", gameId)
    .eq("day_number", dayNumber);
  if (error) throw error;
}

/**
 * Get a vote announcement.
 * @param gameId The game ID.
 * @param dayNumber The day number.
 * @returns The vote announcement.
 */
export async function getVoteAnnouncement(gameId: string, dayNumber: number) {
  const { data, error } = await supabase
    .from("vote_announcements")
    .select("*")
    .eq("game_code", gameId)
    .eq("day_number", dayNumber)
    .single();
  if (error) throw error;
  return data;
}

export async function insertPlayerAction(
  gameId: string,
  dayNumber: number,
  playerId: string,
  roleName: string,
  action: AbilityEffectType,
  pointsSpent: number,
  options: {
    targetPlayerId?: string;
    secondaryTargetPlayerId?: string;
    targetTier?: RoleTier;
    actionSuccessful?: boolean;
    details?: any;
  } = {}
) {
  const { error } = await supabase.from("player_actions").insert({
    game_code: gameId,
    day_number: dayNumber,
    acting_player_id: playerId,
    acting_role_name: roleName,
    action_type: action,
    points_spent: pointsSpent,
    target_player_id: options.targetPlayerId,
    secondary_target_id: options.secondaryTargetPlayerId,
    target_tier: options.targetTier,
    action_successful: options.actionSuccessful,
    action_details: options.details,
  });

  if (error) throw error;
}

/**
 * Get the votes on the imprisoned player.
 * @param gameId The game ID.
 * @param dayNumber The day number.
 * @param imprisonedPlayerId The imprisoned player ID.
 * @returns The voter player IDs as a string array.
 */
export async function getVotesOnImprisonedPlayer(
  gameId: string,
  dayNumber: number,
  imprisonedPlayerId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("game_votes")
    .select("voter_player_id")
    .eq("game_code", gameId)
    .eq("day_number", dayNumber)
    .eq("voted_player_id", imprisonedPlayerId)
    .eq("election_target_role_name", "prison");

  if (error) throw error;

  // Map the results to extract just the voter_player_id strings
  return data?.map((vote) => vote.voter_player_id) || [];
}

// Shuffle array utility
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Tier priority mapping
const tierOrder: Record<string, number> = {
  S: 1,
  A: 2,
  B: 3,
  C: 4,
  D: 5,
};

/**
 * Assign roles to players in a game.
 * @param gameId The game ID.
 * @param hostPlayerId The host player ID.
 * @returns Object with success status and assignments.
 */
export async function assignRolesToPlayers(
  gameId: string,
  hostPlayerId: string
): Promise<{
  success: boolean;
  error?: string;
  assignments?: any[];
  totalAssigned?: number;
}> {
  try {
    // Verify this game exists and the host is legitimate
    const game = await getGameByCode(gameId);

    if (game.host_player_id !== hostPlayerId) {
      return {
        success: false,
        error: "Only the host can assign roles",
      };
    }

    // Fetch all players in the game
    const allPlayersInGame = await getPlayersByGameCode(gameId);

    const alivePlayers = allPlayersInGame.filter((p) => p.status === "Alive");
    alivePlayers.map((p) => ({
      id: p.player_id,
      name: p.player_name,
      status: p.status,
    }));

    if (alivePlayers.length === 0) {
      return {
        success: false,
        error: "No players found in the game",
      };
    }

    // Fetch all randomly assignable roles
    const allRoles = await getAssignableRoles();

    // Sort and separate roles
    const sortedRoles = allRoles.sort(
      (a, b) => tierOrder[a.tier] - tierOrder[b.tier]
    );

    const uniqueRoles = sortedRoles.filter(
      (r) =>
        r.role_name !== "Vice worshipper" && r.role_name !== "Virtue seeker"
    );
    const worshipperRoles = sortedRoles.filter(
      (r) =>
        r.role_name === "Vice worshipper" || r.role_name === "Virtue seeker"
    );

    if (worshipperRoles.length === 0) {
      return {
        success: false,
        error: "Missing worshipper roles in database",
      };
    }

    // Shuffle players and assign roles
    const shuffledPlayers = shuffleArray(alivePlayers);

    const availableUniqueRoles = [...uniqueRoles];

    const assignments: Array<{
      player_id: string;
      player_name: string;
      assigned_role: string;
    }> = [];

    // Update each player individually
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < shuffledPlayers.length; i++) {
      const player = shuffledPlayers[i];
      console.log("player", player);
      console.log("availableUniqueRoles", availableUniqueRoles);

      let assignedRoleName: string;

      if (availableUniqueRoles.length > 0) {
        const roleToAssign = availableUniqueRoles.shift()!;
        assignedRoleName = roleToAssign.role_name;
      } else {
        assignedRoleName =
          worshipperRoles[i % worshipperRoles.length].role_name;
      }

      try {
        await assignRoleNameToPlayer(player.player_id, assignedRoleName, true);
        successCount++;
        assignments.push({
          player_id: player.player_id,
          player_name: player.player_name,
          assigned_role: assignedRoleName,
        });
      } catch (error) {
        console.error(`Failed to update player ${player.player_name}:`, error);
        errorCount++;
      }
      console.log(`assigned ${assignedRoleName} to ${player.player_name}`);
      console.log("availableUniqueRoles", availableUniqueRoles);
    }

    if (errorCount > 0) {
      return {
        success: false,
        error: `Failed to assign roles to ${errorCount} players`,
      };
    }

    return {
      success: true,
      assignments,
      totalAssigned: successCount,
    };
  } catch (error) {
    console.error(`Role assignment error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
}
