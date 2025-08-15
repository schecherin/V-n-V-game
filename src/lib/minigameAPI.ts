export interface MinigameResult {
  playerId: string;
  playerName: string;
  rank: number;
  points: number;
  totalPoints: number;
}

import {
  calculateAndAssignMinigameResults,
  areMinigameResultsCalculated,
} from "./gameApi";
import { getPlayerById } from "./playerApi";

export async function calculateMinigameResults(
  gameCode: string,
  dayNumber: number,
  isHost: boolean = false
): Promise<MinigameResult[]> {
  try {
    if (isHost) {
      // Use the existing function from gameApi.ts
      const results = await calculateAndAssignMinigameResults(
        gameCode,
        dayNumber,
        true // Pass isHost flag
      );

      // Convert to the expected format
      return results.map((result) => ({
        playerId: result.playerId,
        playerName: result.playerName,
        rank: result.rank,
        points: result.points,
        totalPoints: result.totalPoints,
      }));
    } else {
      throw new Error("Only host can calculate minigame results");
    }
  } catch (error) {
    console.error("Failed to calculate minigame results:", error);
    throw error;
  }
}

export async function fetchMinigameResults(
  gameCode: string,
  dayNumber: number,
  playerId: string
): Promise<{ results: MinigameResult[]; calculated: boolean }> {
  try {
    const calculated = await areMinigameResultsCalculated(gameCode, playerId);

    if (calculated) {
      const player = await getPlayerById(playerId);
      const result: MinigameResult = {
        playerId: player.player_id,
        playerName: player.player_name,
        rank: player.last_mini_game_rank || 0,
        points: 0, // We don't store points earned separately
        totalPoints: player.personal_points,
      };

      return {
        results: [result],
        calculated: true,
      };
    } else {
      return {
        results: [],
        calculated: false,
      };
    }
  } catch (error) {
    console.error("Failed to fetch minigame results:", error);
    throw error;
  }
}
