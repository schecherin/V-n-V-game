import { useGameContext } from "@/app/[game_id]/layout";
import { Button } from "@/components/ui/button";
import {
  TREASURY_FREE_PLAYER_COST,
  TREASURY_HOUSE_COST,
  TREASURY_REVEAL_COST,
} from "@/lib/constants";
import { TreasuryActionType } from "@/types";
import {
  setTreasurerAction,
  updateGameGroupPointsPool,
  updateGameProperties,
} from "@/lib/gameApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { updatePlayerStatus } from "@/lib/playerApi";

interface TreasurerViewProps {
  onNextPhase: () => void;
}

const TreasurerView = ({ onNextPhase }: TreasurerViewProps) => {
  const { game, playerId, players } = useGameContext();
  const [houseOfWorshipPurchases, setHouseOfWorshipPurchases] =
    useState<number>(0);
  const [freePlayerPurchases, setFreePlayerPurchases] = useState<string[]>([]);
  const [revealFactionCountPurchase, setRevealFactionCountPurchase] =
    useState<boolean>(false);
  const [pointsToSpend, setPointsToSpend] = useState<number>(
    game?.group_points_pool || 0,
  );

  const [selectedImprisonedPlayer, setSelectedImprisonedPlayer] = useState<
    string | undefined
  >(undefined);

  const isTreasurer = game?.treasurer_player_id === playerId;

  const actionCost = {
    BuildHouseOfWorship: TREASURY_HOUSE_COST,
    FreePlayerFromPrison: TREASURY_FREE_PLAYER_COST,
    RevealFactionCount: TREASURY_REVEAL_COST,
  };

  const playersInPrison = players.filter(
    (player) => player.status === "Imprisoned",
  );

  const handleTreasuryAction = (
    action: TreasuryActionType,
    targetPlayerId?: string,
    details?: string,
  ) => {
    if (!game?.game_code || !playerId) return;

    setTreasurerAction(
      game?.game_code,
      action,
      game?.current_day,
      playerId,
      actionCost[action],
      targetPlayerId,
      details,
    );
  };

  const handleTreasuryActions = () => {
    if (!game) return;
    for (let i = 0; i < houseOfWorshipPurchases; i++) {
      handleTreasuryAction("BuildHouseOfWorship");
    }
    updateGameProperties(game?.game_code, {
      houses_of_worship: game.houses_of_worship + houseOfWorshipPurchases,
    });

    for (const imprisonedPlayerId of freePlayerPurchases) {
      handleTreasuryAction("FreePlayerFromPrison", imprisonedPlayerId);
      updatePlayerStatus(imprisonedPlayerId, "Alive");
    }
    if (revealFactionCountPurchase) {
      handleTreasuryAction("RevealFactionCount");
    }

    if (game?.game_code) {
      updateGameGroupPointsPool(game?.game_code, pointsToSpend);
    }

    setPointsToSpend(game?.group_points_pool || 0);
    setHouseOfWorshipPurchases(0);
    setFreePlayerPurchases([]);
    setRevealFactionCountPurchase(false);
    setSelectedImprisonedPlayer(undefined);

    onNextPhase();
  };

  return isTreasurer ? (
    <div>
      <h1>Treasurer Actions</h1>
      <p>Budget: {pointsToSpend}</p>
      <p>Buying options:</p>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button
            disabled={
              pointsToSpend < TREASURY_HOUSE_COST ||
              houseOfWorshipPurchases + (game?.houses_of_worship ?? 0) >= 3
            }
            onClick={() => {
              setHouseOfWorshipPurchases(houseOfWorshipPurchases + 1);
              setPointsToSpend(pointsToSpend - TREASURY_HOUSE_COST);
            }}
          >
            Buy House of Worship ({TREASURY_HOUSE_COST})
          </Button>
          {houseOfWorshipPurchases > 0 && (
            <>
              <Button
                disabled={
                  pointsToSpend < TREASURY_HOUSE_COST ||
                  houseOfWorshipPurchases + (game?.houses_of_worship ?? 0) >= 3
                }
                variant="secondary"
                size="icon"
                className="size-8"
                onClick={() => {
                  setHouseOfWorshipPurchases(houseOfWorshipPurchases + 1);
                  setPointsToSpend(pointsToSpend - TREASURY_HOUSE_COST);
                }}
              >
                <PlusIcon />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-8"
                onClick={() => {
                  setHouseOfWorshipPurchases(houseOfWorshipPurchases - 1);
                  setPointsToSpend(pointsToSpend + TREASURY_HOUSE_COST);
                }}
              >
                <MinusIcon />
              </Button>
              <p>{houseOfWorshipPurchases} Selected</p>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            disabled={
              pointsToSpend < TREASURY_FREE_PLAYER_COST ||
              !selectedImprisonedPlayer ||
              playersInPrison.length === 0
            }
            onClick={() => {
              selectedImprisonedPlayer &&
                setFreePlayerPurchases([
                  ...freePlayerPurchases,
                  selectedImprisonedPlayer,
                ]);
              setSelectedImprisonedPlayer(undefined);
              setPointsToSpend(pointsToSpend - TREASURY_FREE_PLAYER_COST);
            }}
          >
            Free Player from Prison ({TREASURY_FREE_PLAYER_COST})
          </Button>
          <Select
            value={selectedImprisonedPlayer}
            onValueChange={setSelectedImprisonedPlayer}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a player" />
            </SelectTrigger>
            <SelectContent>
              {playersInPrison.map((player) => (
                <SelectItem key={player.player_id} value={player.player_id}>
                  {player.player_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* List of players to be freed from prison */}
          {freePlayerPurchases.length > 0 && (
            <div className="flex gap-2">
              {freePlayerPurchases.map((playerId) => (
                <>
                  <span key={playerId}>
                    {
                      players.find((player) => player.player_id === playerId)
                        ?.player_name
                    }
                  </span>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-8"
                    onClick={() => {
                      setFreePlayerPurchases(
                        freePlayerPurchases.filter((id) => id !== playerId),
                      );
                      setPointsToSpend(
                        pointsToSpend + TREASURY_FREE_PLAYER_COST,
                      );
                    }}
                  >
                    <MinusIcon />
                  </Button>
                </>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            disabled={
              pointsToSpend < TREASURY_REVEAL_COST || revealFactionCountPurchase
            }
            onClick={() => setRevealFactionCountPurchase(true)}
          >
            Revealing Eye ({TREASURY_REVEAL_COST})
          </Button>
          {revealFactionCountPurchase && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="size-8"
                onClick={() => {
                  setRevealFactionCountPurchase(false);
                  setPointsToSpend(pointsToSpend + TREASURY_REVEAL_COST);
                }}
              >
                <MinusIcon />
              </Button>
              <p>Revealing Eye Selected</p>
            </>
          )}
        </div>
        <Button onClick={() => handleTreasuryActions()}>Confirm</Button>
      </div>
    </div>
  ) : (
    <p>Time to discuss. Wait for the treasurer to finish their actions.</p>
  );
};

export default TreasurerView;
