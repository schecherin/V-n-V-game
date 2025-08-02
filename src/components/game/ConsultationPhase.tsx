import React from "react";
import Button from "../ui/Button";
import { GamePhase } from "@/types";
import { useGameContext } from "@/app/[game_id]/layout";
import TreasurerView from "./TreasurerView";

interface ConsultationPhaseProps {
  onNextPhase: (newPhase?: GamePhase) => void;
}

const ConsultationPhase = ({ onNextPhase }: ConsultationPhaseProps) => {
  const { currentPlayerIsHost, game } = useGameContext();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2>Consultation Phase</h2>
      <TreasurerView onNextPhase={onNextPhase} />
      {/* Host can start voting when the treasurer has finished their actions */}
      {currentPlayerIsHost &&
      game?.current_phase === "Consultation_TreasurerActions" ? (
        <div className="flex flex-col gap-2">
          <Button
            className="bg-green-700 text-white"
            onClick={() => onNextPhase()}
          >
            Start Voting
          </Button>
          <Button onClick={() => onNextPhase("Reflection_RoleActions")}>
            Skip Voting, and go to next phase
          </Button>
        </div>
      ) : (
        <p>
          Time to discuss. Waiting for the treasurer to finish their actions...
        </p>
      )}
    </div>
  );
};

export default ConsultationPhase;
