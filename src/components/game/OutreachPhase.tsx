import React from "react";
import Button from "../ui/Button";
import { Player } from "@/types";

interface OutreachPhaseProps {
  player?: Player;
  onNextPhase: () => void;
  isCurrentUserHost: boolean;
}

const OutreachPhase = ({
  player,
  onNextPhase,
  isCurrentUserHost,
}: Readonly<OutreachPhaseProps>) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2>Outreach Phase</h2>
      {isCurrentUserHost ? (
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
