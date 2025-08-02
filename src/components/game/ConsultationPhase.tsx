import React, { useState } from "react";
import Button from "../ui/Button";
import { GamePhase } from "@/types";
import { useGameContext } from "@/app/[game_id]/layout";

interface ConsultationPhaseProps {
  onNextPhase: (newPhase?: GamePhase) => void;
  onEndGame: () => void;
}

const ConsultationPhase = ({
  onNextPhase,
  onEndGame,
}: ConsultationPhaseProps) => {
  const { players, playerId } = useGameContext();
  const player = players.find((p) => p.player_id === playerId);

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
