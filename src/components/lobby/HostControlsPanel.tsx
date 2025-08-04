import React from "react";
import { Button } from "@/components/ui/button";
import Switch from "../ui/Switch";
import { GameSwitch } from "@/types";
import { useGameContext } from "@/app/[game_id]/layout";
import { MIN_PLAYERS } from "@/lib/constants";

interface HostControlsPanelProps {
  onStartGame: () => void;
  gameSwitches: GameSwitch[];
  onGameSwitchChange: (id: string, value: boolean) => void;
}

const HostControlsPanel: React.FC<HostControlsPanelProps> = ({
  onStartGame,
  gameSwitches,
  onGameSwitchChange,
}) => {
  const { players } = useGameContext();

  // Calculate if game can start based on context
  const canStartGame = players.length >= MIN_PLAYERS; // Get game switches from game context (placeholder - you may need to adjust this based on your game structure)

  return (
    <div className="p-4 bg-cream">
      <h3 className="text-base font-semibold text-brown-dark mb-1">
        Host Controls
      </h3>
      <div className="bg-cream-light p-3 rounded-lg shadow">
        {gameSwitches.map((gs) => (
          <Switch
            key={gs.id}
            id={gs.id}
            checked={gs.checked}
            onChange={(value: boolean) => onGameSwitchChange(gs.id, value)}
            label={gs.label}
          />
        ))}
      </div>
      <div className="mt-6">
        <Button
          onClick={onStartGame}
          disabled={!canStartGame}
          className="w-full text-lg py-3 font-semibold"
        >
          Start Game
        </Button>
      </div>
    </div>
  );
};
export default HostControlsPanel;
