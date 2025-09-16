import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useGameContext } from "@/app/[game_id]/layout";
import { RoleAction, useRoleActions } from "@/hooks/useRoleActions";
import MurderAction from "./roleActions/MurderAction";
import EmpathyAction from "./roleActions/EmpathyAction";
import IntoxicationAction from "./roleActions/IntoxicationAction";

interface ReflectionPhaseProps {
  onNextPhase: () => void;
}

const DESCRIPTION = `Tijdens de reflectiefase kunnen spelers hun rol uitvoeren aan het begin, voordat de minigame is begonnen. Dit kan alleen mits de spelers genoeg persoonlijke punten hebben. Zij krijgen allen 15 seconden de tijd om dit te doen. De spelers die geen rol hebben op dit moment, moeten op "confirm" drukken. Hierna start de minigame.`;

const PHASE_DURATION = 15; // seconds

const ReflectionPhase = ({ onNextPhase }: ReflectionPhaseProps) => {
  const { game, currentPlayerIsHost, players, playerId } = useGameContext();
  const [timer, setTimer] = useState(PHASE_DURATION);
  const [confirmed, setConfirmed] = useState(false);
  const [phaseExpired, setPhaseExpired] = useState(false);
  const player = players.find((p) => p.player_id === playerId);
  const { doRoleAction } = useRoleActions();

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

    const initialRemaining = calculateRemainingTime();

    if (initialRemaining === 0) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateRemainingTime();
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.last_phase_change_at]);

  const roleCost = 10; // Example cost, adjust based on role
  const hasActivatableRole =
    !!player?.current_role_name && player?.personal_points >= roleCost;

  // Handle role action
  const handleRoleAction = async (roleAction: RoleAction) => {
    if (!playerId || !game) return;

    const result = await doRoleAction(roleAction);

    if (result.success) {
      console.log("Role action executed:", result.message);
      handleConfirm();
    } else {
      console.error("Role action failed:", result.message);
      alert(`Action failed: ${result.message}`);
    }
  };

  // Confirm button
  const handleConfirm = () => {
    setConfirmed(true);
  };

  // Start minigame - only available to host
  const handleStartMinigame = () => {
    if (currentPlayerIsHost) {
      onNextPhase();
    }
  };

  const canPerformAction = !confirmed && !phaseExpired && timer > 0;

  const roleActionComponent = useMemo(() => {
    switch (player?.current_role_name) {
      case "Murder":
        return <MurderAction onConfirmAction={handleRoleAction} />;
      case "Empathy":
        return <EmpathyAction onConfirmAction={handleRoleAction} />;
      case "Intoxication":
        return <IntoxicationAction onConfirmAction={handleRoleAction} />;
      default:
        return null;
    }
  }, [player?.current_role_name]);

  // If game data isn't loaded yet, show loading state
  if (!game?.last_phase_change_at) {
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

      {canPerformAction && (
        <>
          {hasActivatableRole ? (
            roleActionComponent
          ) : (
            <Button onClick={handleConfirm} className="mt-4">
              Confirm
            </Button>
          )}
        </>
      )}

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

      {!currentPlayerIsHost && (confirmed || phaseExpired) && (
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

      {!currentPlayerIsHost && (confirmed || phaseExpired) && (
        <div className="mt-6 text-gray-600">
          Wacht tot de host de minigame start...
        </div>
      )}
    </div>
  );
};

export default ReflectionPhase;
