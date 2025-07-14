import React from "react";
import { GamePlayer } from "@/app/game/play/page";

interface OutreachPhaseProps {
  player?: GamePlayer;
  setGamePhase: (phase: "minigame" | "reflection" | "outreach" | "consultation" | "ended") => void;
}

const OutreachPhase = ({ player, setGamePhase }: OutreachPhaseProps) => {
  return <h2>Outreach Phase</h2>;
};

export default OutreachPhase; 