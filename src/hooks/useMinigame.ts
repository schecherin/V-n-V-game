import { useEffect, useState } from "react";
import { Game } from "@/types";
import { getPlayerById } from "@/lib/playerApi";
import {
  calculateMinigameResults,
  type MinigameResult,
} from "@/lib/minigameAPI";
import { insertReflectionPhaseGuess } from "@/lib/gameApi";

interface UseMinigameProps {
  game: Game | null;
  gameId: string;
  playerId: string | null;
  currentPlayerId: string | null;
  isUserHost: boolean;
  gamePhase: string | undefined;
}

export function useMinigame({
  game,
  gameId,
  playerId,
  currentPlayerId,
  isUserHost,
  gamePhase,
}: UseMinigameProps) {
  const [minigameResult, setMinigameResult] = useState<MinigameResult>();
  const [resultsCalculated, setResultsCalculated] = useState(false);

  const handleMinigameResult = async () => {
    if (resultsCalculated || !gameId || !playerId) {
      return;
    }

    setResultsCalculated(true);

    try {
      if (isUserHost) {
        // HOST CALCULATES AND UPDATES DATABASE
        console.log("Host calculating results for everyone...");
        const results = await calculateMinigameResults(
          gameId,
          game?.current_day ?? 0,
          true
        );

        const myResult = results.find((r) => r.playerId === playerId);
        if (myResult) {
          setMinigameResult(myResult);
        }
      } else {
        // GUESTS: Just poll database for their updated rank/points
        console.log("Guest waiting for results...");

        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max

        while (attempts < maxAttempts) {
          // Fetch own player data directly from database
          const player = await getPlayerById(playerId);

          // Check if rank has been set (meaning host calculated)
          if (player.last_mini_game_rank && player.last_mini_game_rank > 0) {
            // Create result object from player data
            const myResult: MinigameResult = {
              playerId: player.player_id,
              playerName: player.player_name,
              rank: player.last_mini_game_rank,
              points: 0, // We don't store points earned separately, could calculate if needed
              totalPoints: player.personal_points,
            };

            setMinigameResult(myResult);
            console.log("Guest found their results:", myResult);
            break;
          }
          // I'm waiting here idk if its the best idea tbh.
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }

        if (attempts === maxAttempts) {
          console.error("Timed out waiting for results");
          setResultsCalculated(false);
        }
      }
    } catch (error) {
      console.error("Failed to handle minigame results:", error);
      setResultsCalculated(false);
    }
  };

  // Reset the flag when phase changes
  useEffect(() => {
    if (gamePhase !== "Reflection_MiniGame_Result") {
      setResultsCalculated(false);
      setMinigameResult(undefined);
    }
  }, [gamePhase]);

  // Trigger calculation when entering results phase
  useEffect(() => {
    if (gamePhase === "Reflection_MiniGame_Result" && !resultsCalculated) {
      handleMinigameResult();
    }
  }, [gamePhase, resultsCalculated, gameId, playerId, isUserHost]);

  const handleMinigameGuess = async (
    targetPlayerId: string,
    guessedRole: string
  ) => {
    if (!currentPlayerId) return;
    try {
      await insertReflectionPhaseGuess({
        game_code: gameId,
        day_number: game?.current_day ?? 1,
        guessed_player_id: targetPlayerId,
        guessed_role_name: guessedRole,
        guessing_player_id: currentPlayerId,
      });
    } catch (err) {
      console.error("Failed to insert minigame guess:", err);
    }
  };

  return { minigameResult, resultsCalculated, handleMinigameGuess };
}
