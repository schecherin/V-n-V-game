import React from "react";
import { GamePlayer } from "@/app/game/play/page";
import Button from "../ui/Button";

interface OutreachPhaseProps {
  player?: GamePlayer;
  setGamePhase: (phase: "minigame" | "reflection" | "outreach" | "consultation" | "ended") => void;
}

const OutreachPhase = ({ player, setGamePhase }: OutreachPhaseProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2>Outreach Phase</h2>
      <Button onClick={() => setGamePhase("consultation")}>Go to next phase</Button>
    </div>
  );
};

export default OutreachPhase; 