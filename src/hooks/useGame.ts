import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getGameById,
  getGameByCodeAndPhase,
  updateGamePlayerCount,
} from "@/lib/gameApi";
import { getPlayerByNameInGame, createPlayer } from "@/lib/playerApi";
import { getCurrentUser, signInAnonymously } from "@/lib/authApi";
import { Game } from "@/types";

export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    getGameById(gameId)
      .then(setGame)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [gameId]);

  const joinGame = useCallback(
    async (gameCode: string, playerName: string) => {
      setLoading(true);
      setError(null);
      try {
        // Sign in anonymously if not already signed in
        let user;
        try {
          user = await getCurrentUser();
        } catch {
          await signInAnonymously();
          user = await getCurrentUser();
        }
        // Get game in lobby phase
        const game = await getGameByCodeAndPhase(gameCode.trim(), "Lobby");
        if (game.current_player_count >= game.max_players) {
          throw new Error("Game is full");
        }
        // Check if player name is already taken
        const existingPlayer = await getPlayerByNameInGame(
          game.game_id,
          playerName.trim()
        );
        if (existingPlayer) {
          throw new Error("Player name already taken in this game");
        }
        // Create player
        const player = await createPlayer({
          game_id: game.game_id,
          player_name: playerName.trim(),
          is_guest: true,
          status: "Alive",
        });
        // Update game player count
        await updateGamePlayerCount(
          game.game_id,
          game.current_player_count + 1
        );
        // Navigate to game lobby
        router.push(
          `/game/${game.game_code}/lobby?playerId=${player.player_id}`
        );
        setLoading(false);
        return { game, player };
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
        setLoading(false);
        throw err;
      }
    },
    [router]
  );

  return { game, loading, error, joinGame };
}
