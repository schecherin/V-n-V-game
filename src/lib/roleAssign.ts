import { supabase } from "./supabase/client";
import { Player, Role } from "@/types";

export const assignRolesToPlayers = async (
  gameId: string,
  hostPlayerId: string
): Promise<{ success: boolean; error?: string; assignments?: any[] }> => {
  try {
    // Get the Supabase URL and anon key from your supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // Construct the edge function URL
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/assign-game-roles`;

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        gameId,
        hostPlayerId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error! status: ${response.status}`,
      };
    }

    return result;
  } catch (error) {
    console.error("Network error calling edge function:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};
