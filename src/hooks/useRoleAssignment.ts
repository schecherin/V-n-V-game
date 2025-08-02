import { useEffect, useState } from "react";
import { assignRolesToPlayers } from "@/lib/roleAssign";
import { supabase } from "@/lib/supabase/client";
import { useGameContext } from "@/app/[game_id]/layout";

export function useRoleAssignment() {
  const { game, players, gameId, currentPlayerIsHost, playerId } =
    useGameContext();
  const [isAssigningRoles, setIsAssigningRoles] = useState(false);

  useEffect(() => {
    const handleRoleAssignment = async () => {
      // Check if roles are already assigned
      const rolesAreAssigned = players.some((p) => p.current_role_name);

      if (
        currentPlayerIsHost &&
        game?.current_phase === "RoleReveal" &&
        !rolesAreAssigned &&
        !isAssigningRoles
      ) {
        setIsAssigningRoles(true);
        console.log("Host is assigning roles via edge function...");

        try {
          // Get the current user's ID (the host)
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            console.error("Host user not authenticated");
            setIsAssigningRoles(false);
            return;
          }
          if (!playerId) {
            console.error("Current player ID is null");
            setIsAssigningRoles(false);
            return;
          }
          const result = await assignRolesToPlayers(gameId, playerId);
          if (result.success) {
            console.log("Roles assigned successfully:", result.assignments);
            // The real-time subscription should automatically update the UI
          } else {
            console.error("Failed to assign roles:", result.error);
          }
        } catch (error) {
          console.error("Error during role assignment:", error);
        } finally {
          setIsAssigningRoles(false);
        }
      }
    };

    // Ensure we have the necessary data before trying to assign roles
    if (game && players.length > 0 && currentPlayerIsHost !== undefined) {
      handleRoleAssignment();
    }
  }, [game, players, currentPlayerIsHost, gameId, isAssigningRoles, playerId]);

  return { isAssigningRoles };
}
