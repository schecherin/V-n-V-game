import { useEffect, useState } from "react";
import { getGameByCode, getAssignableRoles } from "@/lib/gameApi";
import { Game, Player } from "@/types";
import { assignRoleNameToPlayer } from "@/lib/playerApi";

export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    getGameByCode(gameId)
      .then(setGame)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [gameId]);

  return { game, loading, error };
}

export async function assignUniqueRolesToPlayers(players: Player[]) {
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
  const shuffledUniqueRoles = [...uniqueRoles].sort(() => Math.random() - 0.5);
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
    await assignRoleNameToPlayer(player.player_id, role);
  }
  // Assign non-unique roles to remaining players, cycling if needed
  for (let i = shuffledUniqueRoles.length; i < shuffledPlayers.length; i++) {
    const nonUniqueRole =
      shuffledNonUniqueRoles[
        (i - shuffledUniqueRoles.length) % shuffledNonUniqueRoles.length
      ];
    const player = shuffledPlayers[i];
    const role = nonUniqueRole.role_name;
    await assignRoleNameToPlayer(player.player_id, role);
  }
  return;
}
