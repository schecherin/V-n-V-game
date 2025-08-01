import { Game, GamePhase } from "@/types";

export interface MinigameResult {
  playerId: string;
  playerName: string;
  correctGuesses: number;
  rank: number;
  points: number;
}

/**
 * Check if the current player is the host of the game.
 * @param game The game object.
 * @param currentPlayerId The current player's ID.
 * @returns True if the current player is the host, false otherwise.
 */
export function isCurrentUserHost(
  game: Game | null,
  currentPlayerId: string | null
): boolean {
  if (!game || !currentPlayerId) return false;
  return currentPlayerId === game.host_player_id;
}

/**
 * Count correct guesses for each player.
 * @param guesses Array of guesses with guessing_player_id and is_correct.
 * @param players Array of players.
 * @returns Record mapping playerId to number of correct guesses.
 */
export function countCorrectGuesses(
  guesses: { guessing_player_id: string; is_correct: boolean }[],
  players: { player_id: string }[]
): Record<string, number> {
  const correctGuessCount: Record<string, number> = {};
  for (const player of players) {
    correctGuessCount[player.player_id] = 0;
  }
  for (const guess of guesses) {
    if (guess.is_correct) {
      correctGuessCount[guess.guessing_player_id] =
        (correctGuessCount[guess.guessing_player_id] || 0) + 1;
    }
  }
  return correctGuessCount;
}

/**
 * Sort, rank, and assign points to results.
 * @param results Array of MinigameResult (playerId, playerName, correctGuesses)
 * @returns Array of MinigameResult with rank and points assigned
 */
export function rankAndAssignPoints(
  results: Omit<MinigameResult, "rank" | "points">[],
  m: number
): MinigameResult[] {
  // Sort descending by correctGuesses
  results.sort((a, b) => b.correctGuesses - a.correctGuesses);
  let points = m;
  return results.map((r, i) => {
    const newResult = {
      ...r,
      rank: i,
      points: Math.min(Math.round(0.25 * m), Math.round(points)),
    };
    points *= 0.93;
    return newResult;
  });
}

/**
 * Get the next game phase based on the current phase and game state.
 * @param currentPhase The current game phase.
 * @param game The game object.
 * @returns The next game phase.
 */
export function getNextPhase(
  currentPhase: GamePhase,
  game: Game | null
): GamePhase {
  const phaseTransitions: Record<GamePhase, GamePhase> = {
    Lobby: "Lobby",
    RoleReveal: game?.tutorial ? "Tutorial" : "Reflection_MiniGame",
    Tutorial: "Reflection_MiniGame",
    Reflection_RoleActions: "Reflection_MiniGame",
    Reflection_MiniGame: "Reflection_MiniGame_Result",
    Reflection_MiniGame_Result:
      game?.current_day === 1
        ? "Consultation_Elections_Chairperson"
        : game?.include_outreach_phase
        ? "Outreach"
        : "Consultation_Discussion",
    Consultation_Elections_Chairperson: "Consultation_Elections_Secretary",
    Consultation_Elections_Secretary: "Consultation_Elections_Result",
    Consultation_Elections_Result: game?.include_outreach_phase
      ? "Outreach"
      : "Consultation_Discussion",
    Outreach: "Consultation_Discussion",
    // TODO: fix these phases
    Consultation_Discussion: "Reflection_RoleActions",
    Consultation_TreasurerActions: "Reflection_RoleActions",
    Consultation_Voting_Prison: "Reflection_RoleActions",
    Paused: "Paused", // No transition
    Finished: "Finished", // No transition
  };

  const nextPhase = phaseTransitions[currentPhase] || currentPhase;
  return nextPhase;
}
