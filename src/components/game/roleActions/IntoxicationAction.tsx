import { useGameContext } from "@/app/[game_id]/layout";
import { Button } from "@/components/ui/button";
import { RoleAction } from "@/hooks/useRoleActions";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@radix-ui/react-select";
import { useState } from "react";

interface IntoxicationActionProps {
  onConfirmAction: (roleAction: RoleAction) => void;
}

export default function IntoxicationAction({
  onConfirmAction,
}: Readonly<IntoxicationActionProps>) {
  const { players } = useGameContext();
  const [targetPlayerId, setTargetPlayerId] = useState<string>("");
  return (
    <div>
      <h1>Intoxication</h1>
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
            actionType: "Hospitalize",
            targetPlayerId: targetPlayerId,
          })
        }
      >
        Hospitalize
      </Button>
    </div>
  );
}
