import { supabase } from "./supabase/client";

export async function getPlayerById(playerId: string) {
  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single();
  if (error) throw error;
  return player;
}

export async function joinGame(gameCode: string, name: string) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: game, error: roomError } = await supabase
    .from("games")
    .select("game_id")
    .eq("game_code", gameCode)
    .single();
  if (roomError) throw roomError;

  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert([
      {
        game_id: game.game_id,
        user_id: user.id,
        player_name: name,
        state: "Alive",
      },
    ])
    .single();
  if (playerError) throw playerError;

  return player;
}

export async function createGame(gameCode: string) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert([{ game_code: gameCode }])
    .single();
  if (gameError) throw gameError;

  return game;
}
