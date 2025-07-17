import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  generateGameCode,
  checkGameCodeUnique,
  createGame,
} from "@/lib/gameApi";
import { createPlayer } from "@/lib/playerApi";

export function useCreateGame() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [game, setGame] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const router = useRouter();

  const create = useCallback(
    async (playerName: string, maxPlayers: number) => {
      setLoading(true);
      setError("");
      try {
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
          game_status: "Lobby",
          host_user_id: null, // No auth needed
        });
        setGame(game);

        // Create host player
        const player = await createPlayer({
          game_id: game.game_id,
          user_id: null, // No auth needed
          player_name: playerName.trim(),
          is_guest: true,
          status: "Alive",
          personal_points: 0.0,
        });
        setPlayer(player);

        // Navigate to game lobby
        router.push(`/game/${gameCode}/lobby?playerId=${player.player_id}`);
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
