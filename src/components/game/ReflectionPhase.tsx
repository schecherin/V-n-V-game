import React from "react";
import { GamePlayer } from "@/app/game/play/page";

interface ReflectionPhaseProps {
  players: GamePlayer[];
  currentPlayerId: string;
}

const ReflectionPhase = ({ players, currentPlayerId }: ReflectionPhaseProps) => {
  return <h2>Reflection Phase</h2>;
};

export default ReflectionPhase; 