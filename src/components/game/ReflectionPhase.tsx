import React, { useState, useEffect } from "react";
import { GamePlayer } from "@/app/game/play/page";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface ReflectionPhaseProps {
  player?: GamePlayer;
  setGamePhase: (phase: "minigame" | "reflection" | "outreach" | "consultation" | "ended") => void;
}

const DESCRIPTION = `Tijdens de reflectiefase kunnen spelers hun rol uitvoeren aan het begin, voordat de minigame is begonnen. Dit kan alleen mits de spelers genoeg persoonlijke punten hebben. Zij krijgen allen 15 seconden de tijd om dit te doen. De spelers die geen rol hebben op dit moment, moeten op “confirm” drukken. Hierna start de minigame.`;

const ReflectionPhase = ({ player, setGamePhase }: ReflectionPhaseProps) => {
  const [timer, setTimer] = useState(15);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (timer > 0 && !confirmed) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, confirmed]);

  // Placeholder: determine if current player has a role
  const hasRole = player?.role !== undefined; // Replace with real logic

  // Placeholder: role action button
  const handleRoleAction = () => {
    alert("Rol actie uitgevoerd (placeholder)");
    handleConfirm();
  };

  // Confirm button
  const handleConfirm = () => {
    setConfirmed(true);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2>Reflection Phase</h2>
      <p>{DESCRIPTION}</p>
      <div className="mt-4">
        <strong>Tijd resterend: {timer} seconden</strong>
      </div>
      {hasRole ? (
        <Button onClick={handleRoleAction} disabled={confirmed || timer === 0} className="mt-4">
          Voer rol uit (placeholder)
        </Button>
      ) : (
        <Button onClick={handleConfirm} disabled={confirmed || timer === 0} className="mt-4">
          Confirm
        </Button>
      )}
      {confirmed && <div className="text-green-500">Je hebt bevestigd. Wacht op de anderen...</div>}
      {confirmed && <Button onClick={() => setGamePhase("minigame")}>Start minigame</Button>}
    </div>
  );
};

export default ReflectionPhase; 