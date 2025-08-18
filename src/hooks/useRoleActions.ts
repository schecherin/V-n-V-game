import { useGameContext } from "@/app/[game_id]/layout";
import {
  executeMurder,
  murderSelectSuccessor,
  empathyViewVotes,
  executeIntoxication,
  justiceKill,
  justiceProtect,
  executeEnvySwap,
  certaintySeePlayersInTier,
  executeSacrifice,
  executeTorment,
  executeVengeanceGuess,
  executeTruthfulnessReveal,
  RoleTier,
} from "@/lib/roleActionsApi";
import { supabase } from "@/lib/supabase/client";

export interface RoleAction {
  actionType: string;
  targetPlayerId: string;
  secondaryTargetId?: string;
  targetTier?: string;
}

export function useRoleActions() {
  const { gameId, game, playerId } = useGameContext();
  const handleRoleAction = async (roleAction: RoleAction) => {
    const { actionType, targetPlayerId, secondaryTargetId, targetTier } =
      roleAction;
    if (!game) {
      throw new Error("Game not found");
    }
    // PHASE VALIDATION: Ensure we're in the correct phase
    if (game.current_phase !== "Reflection_RoleActions") {
      throw new Error(
        "Actions can only be performed during Reflection Role Actions phase"
      );
    }
    // Get actor player details with acted_today flag
    const { data: actorPlayer, error: actorError } = await supabase
      .from("players")
      .select(
        "player_id, current_role_name, personal_points, status, acted_today"
      )
      .eq("player_id", playerId ?? "")
      .single();
    if (actorError || !actorPlayer) {
      throw new Error("Actor player not found");
    }
    // STATUS VALIDATION: Check if player is alive
    if (actorPlayer.status !== "Alive") {
      throw new Error("Dead or incapacitated players cannot perform actions");
    }
    // ACTED TODAY CHECK: Ensure player hasn't already acted today
    if (actorPlayer.acted_today) {
      throw new Error("You have already performed an action today");
    }
    const yValue = game.max_points_per_day_m;
    let result: { success: boolean; message: string };
    // Execute action based on role
    switch (actorPlayer.current_role_name) {
      case "Murder":
        if (actionType === "Kill") {
          result = await executeMurder(
            gameId,
            actorPlayer.player_id,
            targetPlayerId,
            game.current_day,
            yValue,
            actorPlayer.personal_points
          );
        } else if (actionType === "SelectSuccessor") {
          result = await murderSelectSuccessor(
            gameId,
            actorPlayer.player_id,
            targetPlayerId,
            game.current_day
          );
        } else {
          throw new Error("Invalid action for Murder role");
        }
        break;
      case "Empathy":
        if (actionType === "RevealVotesOnTarget") {
          result = await empathyViewVotes(
            gameId,
            actorPlayer.player_id,
            targetPlayerId,
            game.current_day
          );
        } else {
          throw new Error("Invalid action for Empathy role");
        }
        break;
      case "Intoxication":
        if (actionType === "Hospitalize") {
          result = await executeIntoxication(
            gameId,
            actorPlayer.player_id,
            targetPlayerId,
            game.current_day,
            yValue,
            actorPlayer.personal_points
          );
        } else {
          throw new Error("Invalid action for Intoxication role");
        }
        break;
      case "Justice":
        if (actionType === "Kill") {
          result = await justiceKill(
            gameId,
            actorPlayer.player_id,
            targetPlayerId,
            game.current_day,
            yValue,
            actorPlayer.personal_points
          );
        } else if (actionType === "Protect") {
          result = await justiceProtect(
            gameId,
            actorPlayer.player_id,
            targetPlayerId,
            game.current_day,
            yValue,
            actorPlayer.personal_points
          );
        } else {
          throw new Error("Invalid action for Justice role");
        }
        break;
      case "Envy":
        if (actionType === "SwapIdentity") {
          result = await executeEnvySwap(
            gameId,
            actorPlayer.player_id,
            targetPlayerId,
            game.current_day,
            yValue,
            actorPlayer.personal_points
          );
        } else {
          throw new Error("Invalid action for Envy role");
        }
        break;
      case "Certainty":
        if (actionType === "RevealTierPlayers" && targetTier) {
          result = await certaintySeePlayersInTier(
            gameId,
            actorPlayer.player_id,
            targetTier as RoleTier,
            game.current_day,
            yValue,
            actorPlayer.personal_points
          );
        } else {
          throw new Error("Invalid action for Certainty role");
        }
        break;
      case "Torment":
        if (actionType === "MiniGameDisrupt") {
          result = await executeTorment(
            gameId,
            actorPlayer.player_id,
            targetPlayerId,
            game.current_day
          );
        } else {
          throw new Error("Invalid action for Torment role");
        }
        break;
      case "Sacrifice":
        if (actionType === "SacrificeWithTarget") {
          result = await executeSacrifice(
            gameId,
            actorPlayer.player_id,
            targetPlayerId,
            game.current_day
          );
        } else {
          throw new Error("Invalid action for Sacrifice role");
        }
        break;
      case "Vengeance":
        if (
          actionType === "GuessVoterForHospitalization" &&
          secondaryTargetId
        ) {
          result = await executeVengeanceGuess(
            gameId,
            actorPlayer.player_id,
            targetPlayerId,
            secondaryTargetId,
            game.current_day,
            yValue,
            actorPlayer.personal_points
          );
        } else {
          throw new Error("Invalid action for Vengeance role");
        }
        break;
      case "Truthfulness":
        if (actionType === "RevealAllVotesOnImprisoned") {
          result = await executeTruthfulnessReveal(
            gameId,
            game.current_day,
            targetPlayerId,
            actorPlayer.player_id,
            yValue,
            actorPlayer.personal_points
          );
        } else {
          throw new Error("Invalid action for Truthfulness role");
        }
        break;
      default:
        throw new Error(`Unknown role: ${actorPlayer.current_role_name}`);
    }
    // UPDATE ACTED_TODAY FLAG after successful action
    if (result.success) {
      const { error: updateError } = await supabase
        .from("players")
        .update({
          acted_today: true,
        })
        .eq("player_id", actorPlayer.player_id);
      if (updateError) {
        console.error("Failed to update acted_today flag:", updateError);
      }
    }
  };

  return { handleRoleAction };
}
