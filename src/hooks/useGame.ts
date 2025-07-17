import { useEffect, useState } from "react";
import { getGameByCode, getAssignableRoles } from "@/lib/gameApi";
import { Game, Player } from "@/types";

export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    getGameByCode(gameId)
      .then(setGame)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [gameId]);

  return { game, loading, error };
}
