import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  generateGameCode,
  checkGameCodeUnique,
  createGame,
} from "@/lib/gameApi";
import { createPlayer } from "@/lib/playerApi";
import { signInAnonymously } from "@/lib/authApi";

/**
 * React hook to create a new game and host player.
 * @returns { create, loading, error, game, player }
 */
export function useCreateGame() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [game, setGame] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const router = useRouter();

  /**
   * Create a new game and host player.
   * @param playerName The name of the host player.
   * @param maxPlayers The maximum number of players.
   * @returns The created game and player objects.
   */
  const create = useCallback(
    async (playerName: string, maxPlayers: number) => {
      setLoading(true);
      setError("");
      try {
        // Sign in anonymously to get a user ID
        const user = await signInAnonymously();

        if (!user) {
          throw new Error("Failed to create anonymous user");
        }

        // Generate unique game code
        let gameCode = await generateGameCode();
        let isUnique = false;
        while (!isUnique) {
          isUnique = await checkGameCodeUnique(gameCode);
          if (!isUnique) {
            gameCode = await generateGameCode();
          }
        }

        // Create the game
        const game = await createGame({
          game_code: gameCode,
          max_players: maxPlayers,
          current_player_count: 1,
          current_phase: "Lobby",
          current_day: 0,
          host_user_id: user.id, // Use the anonymous user ID
        });
        setGame(game);

        // Create host player
        const player = await createPlayer({
          game_code: gameCode,
          user_id: user.id, // Use the anonymous user ID
          player_name: playerName.trim(),
          status: "Alive",
          personal_points: 0.0,
        });
        setPlayer(player);

        // Navigate to game lobby
        router.push(`/${gameCode}/lobby?playerId=${player.player_id}`);
        setLoading(false);
        return { game, player };
      } catch (err: any) {
        setError("An unexpected error occurred");
        setLoading(false);
        throw err;
      }
    },
    [router]
  );

  return { create, loading, error, game, player };
}
