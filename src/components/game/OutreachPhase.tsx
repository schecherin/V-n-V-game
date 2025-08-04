import React from "react";
import { Button } from "../ui/button";
import { useGameContext } from "@/app/[game_id]/layout";

interface OutreachPhaseProps {
  onNextPhase: () => void;
}

const OutreachPhase = ({ onNextPhase }: Readonly<OutreachPhaseProps>) => {
  const { currentPlayerIsHost } = useGameContext();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2>Outreach Phase</h2>
      {currentPlayerIsHost ? (
        <Button onClick={onNextPhase}>Go to next phase</Button>
      ) : (
        <div className="text-brown-medium italic text-lg">
          Waiting for the host to continue...
        </div>
      )}
    </div>
  );
};

export default OutreachPhase;
