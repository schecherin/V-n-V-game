import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getGameByCodeAndPhase, updateGamePlayerCount } from "@/lib/gameApi";
import {
  getPlayerByNameInGame,
  createPlayer,
  getPlayerByUserIdInGame,
} from "@/lib/playerApi";
import { getCurrentUser, signInAnonymously } from "@/lib/authApi";
import { Game } from "@/types";

/**
 * React hook to join an existing game as a player.
 * @returns { game, loading, error, joinGame }
 */
export function useJoinGame() {
  const [game, setGame] = useState<Game | null>(null);
  const [existingUser, setExistingUser] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const router = useRouter();

  /**
   * Join a game by code and player name.
   * @param gameCode The code of the game to join.
   * @param playerName The name of the player joining.
   * @returns The joined game and player objects.
   */
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
          setExistingUser(false);
          await signInAnonymously();
          user = await getCurrentUser();
        }
        if (!user?.id) {
          throw new Error("User not found");
        }

        // Fetch the game in the Lobby phase
        const trimmedGameCode = gameCode.trim();
        let foundGame: Game | null = null;
        try {
          foundGame = await getGameByCodeAndPhase(trimmedGameCode, "Lobby");
          setGame(foundGame);
        } catch {
          throw new Error(
            "Could not find a game with that code in the Lobby phase"
          );
        }

        if (!foundGame) {
          throw new Error("Game not found or not in Lobby phase");
        }

        if (foundGame.current_player_count >= foundGame.max_players) {
          throw new Error("Game is full");
        }
        // Check if player name is already taken
        const trimmedPlayerName = playerName.trim();
        const existingPlayer = await getPlayerByNameInGame(
          foundGame.game_code,
          trimmedPlayerName
        );
        if (existingPlayer) {
          throw new Error("Player name already taken in this game");
        }
        // Create player
        let player;
        player = await getPlayerByUserIdInGame(foundGame.game_code, user?.id);
        player ??= await createPlayer({
          game_code: foundGame.game_code,
          user_id: user?.id,
          player_name: trimmedPlayerName,
          status: "Alive",
        });
        // Update game player count
        await updateGamePlayerCount(
          foundGame.game_code,
          foundGame.current_player_count + 1
        );
        // Navigate to game lobby
        router.push(
          `/${foundGame.game_code}/lobby?playerId=${player?.player_id}`
        );
        setLoading(false);
        return { game: foundGame, player };
      } catch (err: any) {
        setError(err?.message || "An unexpected error occurred");
        setLoading(false);
        throw err;
      }
    },
    [router]
  );

  return { game, loading, error, joinGame };
}
