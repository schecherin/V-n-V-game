import { useGameContext } from "@/app/[game_id]/layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleAction } from "@/hooks/useRoleActions";
import { useState } from "react";

interface MurderProps {
  onConfirmAction: (roleAction: RoleAction) => void;
}

export default function MurderAction({
  onConfirmAction,
}: Readonly<MurderProps>) {
  const { players } = useGameContext();
  const [targetPlayerId, setTargetPlayerId] = useState<string>("");
  return (
    <div>
      <h1>Murder</h1>
      <Select
        value={targetPlayerId}
        onValueChange={(value) => {
          setTargetPlayerId(value);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a player" />
        </SelectTrigger>
        <SelectContent>
          {players.map((player) => (
            <SelectItem key={player.player_id} value={player.player_id}>
              {player.player_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        disabled={targetPlayerId === ""}
        onClick={() =>
          onConfirmAction({
            actionType: "Kill",
            targetPlayerId: targetPlayerId,
          })
        }
      >
        Murder
      </Button>
    </div>
  );
}
