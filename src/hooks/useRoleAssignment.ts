import { useEffect, useState, useRef } from "react";
import { assignRolesToPlayers } from "@/lib/gameApi";
import { supabase } from "@/lib/supabase/client";
import { useGameContext } from "@/app/[game_id]/layout";

export function useRoleAssignment() {
  const { game, players, gameId, currentPlayerIsHost, playerId } =
    useGameContext();
  const [isAssigningRoles, setIsAssigningRoles] = useState(false);
  const hasAssignedRoles = useRef(false);

  useEffect(() => {
    const handleRoleAssignment = async () => {
      // Check if roles are already assigned
      const rolesAreAssigned = players.some((p) => p.current_role_name);

      // Prevent multiple executions
      if (hasAssignedRoles.current) {
        console.log(
          "[ROLE ASSIGNMENT] Already assigned roles in this session, skipping"
        );
        return;
      }

      if (
        currentPlayerIsHost &&
        game?.current_phase === "RoleReveal" &&
        !rolesAreAssigned &&
        !isAssigningRoles
      ) {
        console.log("[ROLE ASSIGNMENT] Starting role assignment process");
        setIsAssigningRoles(true);
        hasAssignedRoles.current = true; // Mark as assigned to prevent duplicate runs

        try {
          // Get the current user's ID (the host)
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            console.error("Host user not authenticated");
            setIsAssigningRoles(false);
            hasAssignedRoles.current = false; // Reset on error
            return;
          }
          if (!playerId) {
            console.error("Current player ID is null");
            setIsAssigningRoles(false);
            hasAssignedRoles.current = false; // Reset on error
            return;
          }

          console.log("[ROLE ASSIGNMENT] Calling assignRolesToPlayers");
          const result = await assignRolesToPlayers(gameId, playerId);
          console.log("[ROLE ASSIGNMENT] Role assignment result:", result);

          if (!result.success) {
            console.error(
              "[ROLE ASSIGNMENT] Role assignment failed:",
              result.error
            );
            hasAssignedRoles.current = false; // Reset on failure
          }
        } catch (error) {
          console.error("Error during role assignment:", error);
          hasAssignedRoles.current = false; // Reset on error
        } finally {
          setIsAssigningRoles(false);
        }
      }
    };

    // Ensure we have the necessary data before trying to assign roles
    if (game && players.length > 0 && currentPlayerIsHost !== undefined) {
      handleRoleAssignment();
    }
  }, [game, players, currentPlayerIsHost, gameId, playerId]); // Removed isAssigningRoles from dependencies

  return { isAssigningRoles };
}
