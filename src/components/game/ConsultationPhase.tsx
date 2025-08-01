import React, { useState } from "react";
import Button from "../ui/Button";
import { GamePhase, Player } from "@/types";

interface ConsultationPhaseProps {
  player?: Player;
  players: Player[];
  onNextPhase: (newPhase?: GamePhase) => void;
  onEndGame: () => void;
}

const ConsultationPhase = ({
  player,
  players,
  onNextPhase,
  onEndGame,
}: ConsultationPhaseProps) => {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2">
        <h2>Consultation Phase</h2>
        <Button
          className="bg-green-700 text-white"
          onClick={() => onNextPhase()}
        >
          Start Voting
        </Button>
      </div>

      <Button onClick={() => onNextPhase("Reflection_RoleActions")}>
        Skip Voting, and go to next phase
      </Button>
    </>
  );
};

export default ConsultationPhase;
