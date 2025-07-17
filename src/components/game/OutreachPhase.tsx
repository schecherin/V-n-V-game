import React from "react";
import Button from "../ui/Button";
import { GamePhase, Player } from "@/types";

interface OutreachPhaseProps {
  player?: Player;
  setGamePhase: (phase: GamePhase) => void;
}

const OutreachPhase = ({ player, setGamePhase }: OutreachPhaseProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2>Outreach Phase</h2>
      <Button onClick={() => setGamePhase("Consultation_Discussion")}>
        Go to next phase
      </Button>
    </div>
  );
};

export default OutreachPhase;
