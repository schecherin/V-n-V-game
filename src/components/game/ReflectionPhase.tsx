import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGameContext } from "@/app/[game_id]/layout";
import { GamePhase, Player, Game } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ReflectionPhaseProps {
  onNextPhase: () => void;
}

const DESCRIPTION = `Tijdens de reflectiefase kunnen spelers hun rol uitvoeren aan het begin, voordat de minigame is begonnen. Dit kan alleen mits de spelers genoeg persoonlijke punten hebben. Zij krijgen allen 15 seconden de tijd om dit te doen. De spelers die geen rol hebben op dit moment, moeten op "confirm" drukken. Hierna start de minigame.`;

const PHASE_DURATION = 15; // seconds

const ReflectionPhase = ({ onNextPhase }: ReflectionPhaseProps) => {
  const { game, currentUserIsHost, players, playerId } = useGameContext();
  const [timer, setTimer] = useState(PHASE_DURATION);
  const [confirmed, setConfirmed] = useState(false);
  const [phaseExpired, setPhaseExpired] = useState(false);
  const router = useRouter();
  const player = players.find((p) => p.player_id === playerId);

  useEffect(() => {
    if (!game?.last_phase_change_at) return;

    const calculateRemainingTime = () => {
      // TypeScript guard - we already checked this exists above
      if (!game.last_phase_change_at) return 0;

      const phaseStartTime = new Date(game.last_phase_change_at).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - phaseStartTime) / 1000);
      const remaining = Math.max(0, PHASE_DURATION - elapsedSeconds);

      setTimer(remaining);

      if (remaining === 0) {
        setPhaseExpired(true);
      }

      return remaining;
    };

    // Calculate initial remaining time
    const initialRemaining = calculateRemainingTime();

    // If phase already expired on load, don't start interval
    if (initialRemaining === 0) {
      return;
    }

    // Update timer every second
    const interval = setInterval(() => {
      const remaining = calculateRemainingTime();
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.last_phase_change_at]);

  // Determine if current player has a role that can be activated
  const hasActivatableRole =
    player?.current_role_name !== undefined &&
    player?.current_role_name !== null &&
    player?.personal_points >= 10; // Example cost, adjust based on role

  // Handle role action
  const handleRoleAction = async () => {
    if (!playerId || !game) return;

    try {
      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session found");
        return;
      }

      // Determine action type and parameters based on role
      let actionData: any = {
        gameCode: game.game_code,
        actorPlayerId: playerId,
        dayNumber: game.current_day,
      };

      // Configure action based on role
      switch (player?.current_role_name) {
        case "Murder":
          // For Murder, you'd need UI to select target and action type
          // This is a placeholder - implement target selection UI
          actionData.actionType = "Kill"; // or 'SelectSuccessor'
          actionData.targetPlayerId = ""; // Need target selection
          break;

        case "Empathy":
          actionData.actionType = "RevealVotesOnTarget";
          actionData.targetPlayerId = ""; // Need target selection
          break;

        case "Intoxication":
          actionData.actionType = "Hospitalize";
          actionData.targetPlayerId = ""; // Need target selection
          break;

        case "Justice":
          // Need UI to choose between Kill or Protect
          actionData.actionType = "Protect"; // or 'Kill'
          actionData.targetPlayerId = ""; // Need target selection
          break;

        case "Envy":
          actionData.actionType = "SwapIdentity";
          actionData.targetPlayerId = ""; // Need target selection
          break;

        case "Certainty":
          actionData.actionType = "RevealTierPlayers";
          actionData.targetTier = "B"; // Need tier selection UI (S, A, B, C, D)
          break;

        case "Torment":
          actionData.actionType = "MiniGameDisrupt";
          actionData.targetPlayerId = ""; // Need target selection
          break;

        case "Sacrifice":
          actionData.actionType = "SacrificeWithTarget";
          actionData.targetPlayerId = ""; // Need target selection
          break;

        case "Vengeance":
          actionData.actionType = "GuessVoterForHospitalization";
          actionData.targetPlayerId = ""; // imprisoned player
          actionData.secondaryTargetId = ""; // guessed voter
          break;

        case "Truthfulness":
          actionData.actionType = "RevealAllVotesOnImprisoned";
          // No target needed
          break;

        default:
          console.error("Unknown role:", player?.current_role_name);
          return;
      }

      // Make the API call to the edge function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-role-action`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(actionData),
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log("Role action executed:", result.message);

        // Show success message to user
        if (result.data) {
          // Handle role-specific response data
          console.log("Action result:", result.data);

          // For roles that reveal information, you might want to show it
          // For example, for Empathy showing voters, Certainty showing tier players, etc.
          // This would require additional UI components
        }

        // Mark as confirmed after successful action
        handleConfirm();
      } else {
        console.error("Role action failed:", result.message);
        alert(`Action failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error executing role action:", error);
      alert("Failed to execute role action. Please try again.");
    }
  };

  // Confirm button
  const handleConfirm = () => {
    setConfirmed(true);
  };

  // Start minigame - only available to host
  const handleStartMinigame = () => {
    if (currentUserIsHost) {
      onNextPhase();
    }
  };

  const canPerformAction = !confirmed && !phaseExpired && timer > 0;

  // If game data isn't loaded yet, show loading state
  if (!game || !game.last_phase_change_at) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-2xl font-bold">Reflection Phase</h2>
        <p className="text-gray-600">Loading game data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-bold">Reflection Phase</h2>
      <p className="text-center max-w-2xl text-gray-700">{DESCRIPTION}</p>

      <div className="mt-4 text-xl font-semibold">
        <span className={timer <= 5 ? "text-red-500" : ""}>
          Tijd resterend: {timer} seconden
        </span>
      </div>

      {/* Action buttons */}
      {canPerformAction && (
        <>
          {hasActivatableRole ? (
            <Button
              onClick={handleRoleAction}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Voer rol uit: {player?.current_role_name}
            </Button>
          ) : (
            <Button onClick={handleConfirm} className="mt-4">
              Confirm
            </Button>
          )}
        </>
      )}

      {/* Status messages */}
      {confirmed && (
        <div className="text-green-500 font-semibold">
          ✓ Je hebt bevestigd. Wacht op de anderen...
        </div>
      )}

      {phaseExpired && !confirmed && (
        <div className="text-orange-500 font-semibold">
          ⏱️ Tijd verstreken - je hebt geen actie ondernomen
        </div>
      )}

      {/* Host control to proceed */}
      {!currentUserIsHost && (confirmed || phaseExpired) && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-sm text-gray-600">
            Als host kun je de minigame starten:
          </p>
          <Button
            onClick={handleStartMinigame}
            className="bg-green-600 hover:bg-green-700"
          >
            Start Minigame →
          </Button>
        </div>
      )}

      {/* Non-host waiting message */}
      {!currentUserIsHost && (confirmed || phaseExpired) && (
        <div className="mt-6 text-gray-600">
          Wachten tot de host de minigame start...
        </div>
      )}
    </div>
  );
};

export default ReflectionPhase;
