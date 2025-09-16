import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GamePhase, TreasuryTransaction } from "@/types";
import { useGameContext } from "@/app/[game_id]/layout";
import TreasurerView from "./TreasurerView";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { getGameTreasurerActions } from "@/lib/gameApi";
import { Card, CardContent } from "../ui/card";
import { getVicesAndVirtues } from "@/lib/gameUtils";

interface ConsultationPhaseProps {
  onNextPhase: (newPhase?: GamePhase) => void;
}

const ConsultationPhase = ({ onNextPhase }: ConsultationPhaseProps) => {
  const { currentPlayerIsHost, game, players, roles } = useGameContext();
  const [treasurerActions, setTreasurerActions] = useState<
    TreasuryTransaction[]
  >([]);
  const [factionCounts, setFactionCounts] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    const fetchTreasurerActions = async () => {
      const treasurerActions = game
        ? await getGameTreasurerActions(game?.game_code, game?.current_day)
        : [];
      setTreasurerActions(treasurerActions);
    };
    fetchTreasurerActions();
  }, [game]);

  useEffect(() => {
    const factions = getVicesAndVirtues(players, roles);
    setFactionCounts({
      virtues: factions.virtues.length,
      vices: factions.vices.length,
    });
  }, [players, roles]);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2>Consultation Phase</h2>
      {game?.current_phase === "Consultation_Discussion" && (
        <TreasurerView onNextPhase={onNextPhase} />
      )}

      {game?.current_phase === "Consultation_TreasurerActions" && (
        <>
          <h3>Treasurer Actions</h3>
          <Carousel opts={{ loop: true }} className="w-full max-w-md">
            <CarouselContent>
              {treasurerActions.map((action) => (
                <CarouselItem key={action.transaction_id}>
                  <div className="p-1">
                    <Card>
                      <CardContent>
                        {action.action_type === "BuildHouseOfWorship" && (
                          <h3>House of Worship Built</h3>
                        )}
                        {action.action_type === "FreePlayerFromPrison" && (
                          <h3>
                            {
                              players.find(
                                (player) =>
                                  player.player_id === action.target_player_id,
                              )?.player_name
                            }{" "}
                            Freed from Prison
                          </h3>
                        )}
                        {action.action_type === "RevealFactionCount" && (
                          <>
                            <h3>Revealing Eye</h3>
                            <p>
                              There are {factionCounts.virtues} Virtues left
                            </p>
                            <p>There are {factionCounts.vices} Vices left</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {treasurerActions.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </>
      )}
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
          <Button
            onClick={() => onNextPhase("Reflection_RoleActions_Selection")}
          >
            Skip Voting, and go to next phase
          </Button>
        </div>
      ) : (
        <p>Time to discuss. Wait for the host to start the voting.</p>
      )}
    </div>
  );
};

export default ConsultationPhase;
