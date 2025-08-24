import { useGameContext } from "@/app/[game_id]/layout";
import { Button } from "../ui/button";
import { fetchSuccessfulRoleActions } from "@/lib/roleActionsApi";
import { PlayerAction } from "@/types";
import { useEffect, useState } from "react";

interface ReflectionPhaseRevealProps {
  onNextPhase: () => void;
}

export default function ReflectionPhaseReveal({
  onNextPhase,
}: Readonly<ReflectionPhaseRevealProps>) {
  const { game, playerId } = useGameContext();
  const [roleActions, setRoleActions] = useState<PlayerAction[]>([]);

  useEffect(() => {
    const fetchRoleActions = async () => {
      if (game) {
        const roleActions = await fetchSuccessfulRoleActions(
          game.game_code,
          game.current_day
        );
        setRoleActions(roleActions);
      }
    };
    fetchRoleActions();
  }, [game]);

  const playerIsDead = roleActions.some(
    (roleAction) =>
      roleAction.target_player_id === playerId &&
      roleAction.action_type === "Kill"
  );

  const playerIsHospitalized = roleActions.some(
    (roleAction) =>
      roleAction.target_player_id === playerId &&
      roleAction.action_type === "Hospitalize"
  );

  return (
    <div>
      <h1>Reflection Phase Reveal</h1>
      {playerIsDead && <p>You are dead</p>}
      {playerIsHospitalized && <p>You are hospitalized</p>}
      <Button onClick={onNextPhase}>Next Phase</Button>
    </div>
  );
}
