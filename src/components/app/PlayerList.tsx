import { useGameContext } from "@/app/[game_id]/layout";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
  DrawerTitle,
} from "../ui/drawer";
import { Player } from "@/types";
import { useEffect, useState } from "react";

interface PlayerListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlayerListDrawer = ({ isOpen, onClose }: PlayerListDrawerProps) => {
  const { game, players, playerId } = useGameContext();
  const [host, setHost] = useState<Player | undefined>(undefined);
  const [secretary, setSecretary] = useState<Player | undefined>(undefined);
  const [treasurer, setTreasurer] = useState<Player | undefined>(undefined);
  const [imprisonedPlayers, setImprisonedPlayers] = useState<Player[]>([]);
  const [hospitalizedPlayers, setHospitalizedPlayers] = useState<Player[]>([]);
  const [deadPlayers, setDeadPlayers] = useState<Player[]>([]);
  const [playersInGame, setPlayersInGame] = useState<Player[]>([]);

  useEffect(() => {
    if (game) {
      setHost(players.find((p) => p.player_id === game.host_player_id));
      setSecretary(
        players.find((p) => p.player_id === game.secretary_player_id)
      );
      setTreasurer(
        players.find((p) => p.player_id === game.treasurer_player_id)
      );
      setImprisonedPlayers(players.filter((p) => p.status === "Imprisoned"));
      setHospitalizedPlayers(
        players.filter((p) => p.status === "Hospitalized")
      );
      setDeadPlayers(players.filter((p) => p.status === "Dead"));
      setPlayersInGame(
        players.filter(
          (p) =>
            p.status === "Alive" &&
            p.player_id !== game.host_player_id &&
            p.player_id !== game.secretary_player_id &&
            p.player_id !== game.treasurer_player_id
        )
      );
    }
  }, [game, players]);

  const renderPlayerSection = (
    title: string,
    players: Player[],
    bgColor: string
  ) => (
    <>
      {players.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.player_id}
                className={`p-3 rounded-lg border ${bgColor} ${
                  player.player_id === playerId ? "ring-2 ring-blue-300" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.player_name}</span>
                    {player.player_id === playerId && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">
                        You
                      </span>
                    )}
                    {player.player_id === game?.host_player_id && (
                      <span className="text-xs text-purple-600 bg-purple-100 px-1 rounded">
                        Host
                      </span>
                    )}
                    {player.player_id === game?.secretary_player_id && (
                      <span className="text-xs text-green-600 bg-green-100 px-1 rounded">
                        Secretary
                      </span>
                    )}
                    {player.player_id === game?.treasurer_player_id && (
                      <span className="text-xs text-orange-600 bg-orange-100 px-1 rounded">
                        Treasurer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
        <DrawerHeader className="relative flex">
          <DrawerTitle className="text-xl font-semibold text-start">
            Players ({players.length})
          </DrawerTitle>
          <DrawerClose className="absolute top-4 right-8 w-6 h-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </DrawerClose>
        </DrawerHeader>

        <div className="p-4 space-y-4 mb-16 overflow-y-auto">
          {/* Officers first */}
          {renderPlayerSection(
            "Officers",
            [host, secretary, treasurer].filter(Boolean) as Player[],
            "bg-purple-50 border-purple-200"
          )}

          {/* Other alive players */}
          {renderPlayerSection(
            "Alive Players",
            playersInGame,
            "bg-green-50 border-green-200"
          )}

          {/* Hospitalized Players */}
          {renderPlayerSection(
            "Hospitalized",
            hospitalizedPlayers,
            "bg-yellow-50 border-yellow-200"
          )}

          {/* Imprisoned Players */}
          {renderPlayerSection(
            "Imprisoned",
            imprisonedPlayers,
            "bg-red-50 border-red-200"
          )}

          {/* Dead Players */}
          {renderPlayerSection(
            "Dead",
            deadPlayers,
            "bg-gray-50 border-gray-200"
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayerListDrawer;
