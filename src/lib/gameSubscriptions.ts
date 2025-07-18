import { supabase } from "@/lib/supabase/client";

/**
 * Subscribe to real-time updates for a specific game.
 * @param gameCode The game_code to subscribe to.
 * @param onUpdate Callback for update events (payload: SupabaseRealtimePayload)
 * @returns Unsubscribe function
 */
export function subscribeToGameUpdates(
  gameCode: string,
  onUpdate: (payload: any) => void
) {
  const channel = supabase
    .channel(`game-${gameCode}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "games",
        filter: `game_code=eq.${gameCode}`,
      },
      onUpdate
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to real-time updates for players in a specific game.
 * @param gameCode The game_code to subscribe to.
 * @param onUpdate Callback for update events (payload: SupabaseRealtimePayload)
 * @returns Unsubscribe function
 */
export function subscribeToPlayerUpdates(
  gameCode: string,
  onUpdate: (payload: any) => void
) {
  console.log("Creating player subscription for game:", gameCode);
  const channel = supabase
    .channel(`players-${gameCode}`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to INSERT, UPDATE, DELETE
        schema: "public",
        table: "players",
        filter: `game_code=eq.${gameCode}`,
      },
      (payload) => {
        console.log("Player subscription payload:", payload);
        onUpdate(payload);
      }
    )
    .on("system", { event: "disconnect" }, () => {
      console.log("Player subscription disconnected");
    })
    .on("system", { event: "reconnect" }, () => {
      console.log("Player subscription reconnected");
    })
    .subscribe((status) => {
      console.log("Player subscription status:", status);
    });

  return () => {
    console.log("Removing player subscription for game:", gameCode);
    supabase.removeChannel(channel);
  };
}
