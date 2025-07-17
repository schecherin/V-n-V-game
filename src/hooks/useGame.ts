import { useEffect, useState } from "react";
import { getGameById } from "@/lib/gameApi";
import { Game } from "@/types";

export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    getGameById(gameId)
      .then(setGame)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [gameId]);

  return { game, loading, error };
}
