import React from "react";
import { GamePlayer } from "@/app/game/play/page";

interface ConsultationPhaseProps {
  players: GamePlayer[];
  currentPlayerId: string;
}

const ConsultationPhase = ({ players, currentPlayerId }: ConsultationPhaseProps) => {
  return <h2>Consultation Phase</h2>;
};

export default ConsultationPhase; 