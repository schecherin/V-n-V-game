import { useEffect, useState, useCallback } from "react";
import { getGameByCode, getAssignableRoles } from "@/lib/gameApi";
import { Game, Player } from "@/types";
import { assignRoleNameToPlayer, getPlayersByGameCode } from "@/lib/playerApi";
import {
  subscribeToGameUpdates,
  subscribeToPlayerUpdates,
} from "@/lib/gameSubscriptions";

/**
 * React hook to fetch and manage game state by gameId.
 * @param gameId The game code.
 * @returns { game, loading, error, assignRoles }
 */
export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Memoized refetch function
  const refetchData = useCallback(async () => {
    try {
      const [gameData, playersData] = await Promise.all([
        getGameByCode(gameId),
        getPlayersByGameCode(gameId),
      ]);
      setGame(gameData);
      setPlayers(playersData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err);
    }
  }, [gameId]);

  // Initial data fetch
  useEffect(() => {
    setLoading(true);
    refetchData().finally(() => setLoading(false));
  }, [refetchData]);

  /* // Handle page visibility and focus changes
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchData();
        // Stop polling when visible
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      } else {
        // Start polling when hidden
        pollingInterval = setInterval(() => {
          refetchData();
        }, 5000); // Poll every 3 seconds when hidden
      }
    };

    const handleWindowFocus = () => {
      refetchData();
    };

    // Set up event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    // Start polling if page is already hidden
    if (document.hidden) {
      pollingInterval = setInterval(() => {
        refetchData();
      }, 5000);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [refetchData]); */

  /**
   * Assign roles to players in the game.
   * @param players Array of Player objects.
   */
  const assignRoles = async (players: Player[]) => {
    // Fetch assignable roles
    const roles = await getAssignableRoles();
    if (!roles || roles.length === 0) {
      throw new Error("No assignable roles found");
    }
    // Split roles into unique and non-unique
    const uniqueRoles = roles.filter((r: any) => r.is_unique);
    const nonUniqueRoles = roles.filter((r: any) => !r.is_unique);
    // Shuffle players and roles for fairness
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const shuffledUniqueRoles = [...uniqueRoles].sort(
      () => Math.random() - 0.5
    );
    const shuffledNonUniqueRoles = [...nonUniqueRoles].sort(
      () => Math.random() - 0.5
    );

    // Assign unique roles first
    for (
      let i = 0;
      i < shuffledUniqueRoles.length && i < shuffledPlayers.length;
      i++
    ) {
      const player = shuffledPlayers[i];
      const role = shuffledUniqueRoles[i].role_name;
      await assignRoleNameToPlayer(player.player_id, role, true);
    }
    // Assign non-unique roles to remaining players, cycling if needed
    for (let i = shuffledUniqueRoles.length; i < shuffledPlayers.length; i++) {
      const nonUniqueRole =
        shuffledNonUniqueRoles[
          (i - shuffledUniqueRoles.length) % shuffledNonUniqueRoles.length
        ];
      const player = shuffledPlayers[i];
      const role = nonUniqueRole.role_name;
      await assignRoleNameToPlayer(player.player_id, role, true);
    }
  };

  return {
    game,
    players,
    loading,
    error,
    assignRoles,
    refetchData,
    lastUpdate,
  };
}
