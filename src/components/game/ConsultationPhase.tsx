import React from "react";
import { GamePlayer } from "@/app/game/play/page";

interface ConsultationPhaseProps {
  player?: GamePlayer;
  setGamePhase: (phase: "minigame" | "reflection" | "outreach" | "consultation" | "ended") => void;
}

const ConsultationPhase = ({ player, setGamePhase }: ConsultationPhaseProps) => {
  return <h2>Consultation Phase</h2>;
};

export default ConsultationPhase; 