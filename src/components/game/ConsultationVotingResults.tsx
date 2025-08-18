import { useGameContext } from "@/app/[game_id]/layout";
import { getVoteAnnouncement, getVotesOnImprisonedPlayer } from "@/lib/gameApi";
import { VoteAnnouncement } from "@/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRoleActions } from "@/hooks/useRoleActions";

interface ConsultationVotingResultsProps {
  onNextPhase: () => void;
}

export default function ConsultationVotingResults({
  onNextPhase,
}: Readonly<ConsultationVotingResultsProps>) {
  const { game, players, playerId, currentPlayerIsHost, playerActions } =
    useGameContext();
  const [voteAnnouncement, setVoteAnnouncement] =
    useState<VoteAnnouncement | null>(null);
  const [truthfulnessAction, setTruthfulnessAction] = useState<boolean>(false);
  const { handleRoleAction } = useRoleActions();

  useEffect(() => {
    if (game) {
      getVoteAnnouncement(game.game_code, game.current_day).then(
        (voteAnnouncement) => {
          setVoteAnnouncement(voteAnnouncement);
        }
      );
    }
  }, [game]);

  const handleReveal = () => {
    setTruthfulnessAction(true);
    handleRoleAction({
      actionType: "RevealAllVotesOnImprisoned",
      targetPlayerId: voteAnnouncement!.imprisoned_player_id!,
    });
  };

  const revealAllVotesOnImprisoned = async () => {
    const votes = await getVotesOnImprisonedPlayer(
      game!.game_code,
      game!.current_day,
      voteAnnouncement!.imprisoned_player_id!
    );
    return votes;
  };

  return (
    <div>
      <h2>
        {
          players.find(
            (p) => p.player_id === voteAnnouncement?.imprisoned_player_id
          )?.player_name
        }
      </h2>
      <p>This player has been imprisoned</p>
      {players.find((p) => p.player_id === playerId)?.current_role_name ===
        "Truthfulness" &&
        !truthfulnessAction && (
          <>
            <p>Reveal vote results to the group?</p>
            {/* TODO: Add cost */}
            <Button onClick={handleReveal}>Reveal (cost)</Button>
            <Button onClick={() => setTruthfulnessAction(false)}>
              Keep secret
            </Button>
          </>
        )}
      {playerActions.some(
        (a) =>
          a.action_type === "RevealAllVotesOnImprisoned" &&
          a.day_number === game?.current_day
      ) && (
        <div>
          <p>Vote results revealed</p>
          <p>
            {revealAllVotesOnImprisoned().then((votes) => {
              return votes
                .map((v) => players.find((p) => p.player_id === v)?.player_name)
                .join(", ");
            })}
          </p>
        </div>
      )}
      {currentPlayerIsHost && (
        <Button
          onClick={() => {
            onNextPhase();
          }}
        >
          Continue
        </Button>
      )}
    </div>
  );
}
