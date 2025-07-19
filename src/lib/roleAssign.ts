import { supabase } from "./supabase/client";
import { Player, Role } from "@/types"; // Assuming your types are in @/types

/**
 * Shuffles an array in place and returns it.
 * @param array The array to shuffle.
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Defines the priority of each role tier. Lower number is higher priority.
const tierOrder: { [key: string]: number } = { S: 1, A: 2, B: 3, C: 4, D: 5 };

/**
 * Assigns roles to players based on tier priority and uniqueness.
 * This function should only be called by the host.
 * @param gameId The ID of the current game.
 * @param players An array of all players in the game.
 * @returns An object indicating success or failure.
 */
export const assignRolesToPlayers = async (
  gameId: string,
  players: Player[]
): Promise<{ success: boolean; error?: any }> => {
  console.log("Starting role assignment process...");
  try {
    // Step 1: Fetch all randomly assignable roles from the database.
    const { data: allRoles, error: rolesError } = await supabase
      .from("roles")
      .select("*")
      .eq("can_be_assigned_randomly", true);

    if (rolesError) throw rolesError;

    // Step 2: Sort roles by tier priority (S > A > B > C > D).
    const sortedRoles = (allRoles as Role[]).sort(
      (a, b) => tierOrder[a.tier] - tierOrder[b.tier]
    );

    // Step 3: Separate unique roles from the non-unique "Worshipper" roles.
    const uniqueRoles = sortedRoles.filter(
      (r) =>
        r.role_name !== "Vice worshipper" && r.role_name !== "Virtue seeker"
    );
    const worshipperRoles = sortedRoles.filter(
      (r) =>
        r.role_name === "Vice worshipper" || r.role_name === "Virtue seeker"
    );

    if (worshipperRoles.length === 0) {
      throw new Error(
        "Game setup error: 'Worshipper' or 'Seeker' roles are missing from the database."
      );
    }

    // Step 4: Shuffle players to ensure random role assignment.
    const shuffledPlayers = shuffleArray(players);
    const assignments: {
      player_id: string;
      current_role_name: string;
      original_role_name: string;
    }[] = [];
    const availableUniqueRoles = [...uniqueRoles];

    // Step 5: Iterate through players and assign roles.
    for (const player of shuffledPlayers) {
      let assignedRoleName: string;

      // Prioritize assigning unique roles first.
      if (availableUniqueRoles.length > 0) {
        const roleToAssign = availableUniqueRoles.shift(); // Take the highest-tier unique role
        assignedRoleName = roleToAssign!.role_name;
      } else {
        // Once all unique roles are assigned, fill remaining spots with Worshippers.
        // This alternates between the available worshipper roles.
        assignedRoleName =
          worshipperRoles[assignments.length % worshipperRoles.length]
            .role_name;
      }
      assignments.push({
        player_id: player.player_id,
        current_role_name: assignedRoleName,
        original_role_name: assignedRoleName,
      });
    }

    // Step 6: Atomically update all players in the database with their new roles.
    // Using Promise.all to send all update requests concurrently.
    const updatePromises = assignments.map((assignment) =>
      supabase
        .from("players")
        .update({
          current_role_name: assignment.current_role_name,
          original_role_name: assignment.original_role_name,
        })
        .eq("player_id", assignment.player_id)
    );

    const results = await Promise.all(updatePromises);
    const firstError = results.find((res) => res.error);

    if (firstError) {
      // If any update fails, throw the error.
      throw firstError.error;
    }

    console.log("Roles assigned and updated in DB successfully.");
    return { success: true };
  } catch (error) {
    console.error("Error during the role assignment process:", error);
    return { success: false, error };
  }
};
