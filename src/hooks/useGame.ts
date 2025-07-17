import { useEffect, useState } from "react";
import { getGameById } from "../lib/gameApi";
import { Database, Tables, Enums } from "../database.types";

export function useGame(gameId: string) {
  const [game, setGame] = useState<Tables<"games"> | null>(null);
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

