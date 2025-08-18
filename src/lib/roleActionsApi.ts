import { supabase } from "@/lib/supabase/client";
import { getPlayerById, fetchPlayerPoints } from "@/lib/playerApi";
import { getGameByCode } from "@/lib/gameApi";

export type RoleTier = "S" | "A" | "B" | "C" | "D";
export interface RoleActionResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface PlayerVote {
  voter_player_id: string;
  voted_player_id: string;
  voter_name: string;
}

export async function executeMurder(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number,
  yValue: number,
  actorPoints: number
) {
  const requiredPoints = yValue;
  if (actorPoints < requiredPoints) {
    return {
      success: false,
      message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}`,
    };
  }
  // Validate target exists and is alive
  const { data: targetPlayer } = await supabase
    .from("players")
    .select("player_id, status")
    .eq("player_id", targetPlayerId)
    .eq("game_code", gameCode)
    .single();
  if (!targetPlayer || targetPlayer.status !== "Alive") {
    return {
      success: false,
      message: "Invalid target or target is not alive",
    };
  }
  // Check if target is protected
  const { data: protection } = await supabase
    .from("player_protections")
    .select("*")
    .eq("game_code", gameCode)
    .eq("protected_player_id", targetPlayerId)
    .eq("protection_type", "murder_intoxication")
    .gte("expires_at_day", dayNumber)
    .single();
  if (protection) {
    return {
      success: false,
      message: "Target is protected from murder",
    };
  }
  // Execute murder
  const { error: murderError } = await supabase
    .from("players")
    .update({
      status: "Dead",
    })
    .eq("player_id", targetPlayerId);
  if (murderError) throw murderError;
  // Deduct points
  const { error: pointsError } = await supabase
    .from("players")
    .update({
      personal_points: actorPoints - requiredPoints,
    })
    .eq("player_id", actorPlayerId);
  if (pointsError) throw pointsError;
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameCode,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Murder",
    action_type: "Kill",
    target_player_id: targetPlayerId,
    points_spent: requiredPoints,
    action_successful: true,
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: "Murder executed successfully",
  };
}
export async function murderSelectSuccessor(
  gameCode: string,
  murderPlayerId: string,
  successorPlayerId: string,
  dayNumber: number
) {
  // Get successor's current role
  const { data: successor, error: successorError } = await supabase
    .from("players")
    .select("current_role_name, status")
    .eq("player_id", successorPlayerId)
    .eq("game_code", gameCode)
    .single();
  if (successorError || !successor || successor.status !== "Alive") {
    return {
      success: false,
      message: "Successor not found or not alive",
    };
  }
  // Update successor to have Murder role
  const { error: updateError } = await supabase
    .from("players")
    .update({
      current_role_name: "Murder",
      role_inherited_from: murderPlayerId,
    })
    .eq("player_id", successorPlayerId);
  if (updateError) throw updateError;
  // Log inheritance choice
  const { error: inheritanceError } = await supabase
    .from("role_inheritance_choices")
    .insert({
      game_code: gameCode,
      day_number: dayNumber,
      deceased_player_id: murderPlayerId,
      deceased_role_name: "Murder",
      inheritor_player_id: successorPlayerId,
      original_inheritor_role_name: successor.current_role_name ?? "",
      choice_made_at: new Date().toISOString(),
    });
  if (inheritanceError) throw inheritanceError;
  return {
    success: true,
    message: "Successor selected successfully",
  };
}
export async function empathyViewVotes(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
) {
  // Validate target
  const { data: targetPlayer } = await supabase
    .from("players")
    .select("player_id")
    .eq("player_id", targetPlayerId)
    .eq("game_code", gameCode)
    .single();
  if (!targetPlayer) {
    return {
      success: false,
      message: "Invalid target player",
    };
  }
  // Get votes on target from previous day
  const { data: votes, error: votesError } = await supabase
    .from("game_votes")
    .select(
      `
      voter_player_id,
      players!game_votes_voter_player_id_fkey(player_name)
    `
    )
    .eq("game_code", gameCode)
    .eq("voted_player_id", targetPlayerId)
    .eq("day_number", dayNumber - 1); // Previous day's votes
  if (votesError) throw votesError;
  const voterInfo =
    votes?.map((vote) => ({
      voter_player_id: vote.voter_player_id,
      voter_name: vote.players?.player_name || "Unknown",
    })) || [];
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameCode,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Empathy",
    action_type: "RevealVotesOnTarget",
    target_player_id: targetPlayerId,
    points_spent: 0,
    action_successful: true,
    action_details: {
      voters: voterInfo,
    },
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: "Vote information retrieved",
    data: {
      voters: voterInfo,
    },
  };
}
export async function executeIntoxication(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number,
  yValue: number,
  actorPoints: number
) {
  const requiredPoints = yValue;
  if (actorPoints < requiredPoints) {
    return {
      success: false,
      message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}`,
    };
  }
  // Validate target
  const { data: targetPlayer } = await supabase
    .from("players")
    .select("player_id, status")
    .eq("player_id", targetPlayerId)
    .eq("game_code", gameCode)
    .single();
  if (!targetPlayer || targetPlayer.status !== "Alive") {
    return {
      success: false,
      message: "Invalid target or target is not alive",
    };
  }
  // Check if target is protected
  const { data: protection } = await supabase
    .from("player_protections")
    .select("*")
    .eq("game_code", gameCode)
    .eq("protected_player_id", targetPlayerId)
    .eq("protection_type", "murder_intoxication")
    .gte("expires_at_day", dayNumber)
    .single();
  if (protection) {
    return {
      success: false,
      message: "Target is protected from intoxication",
    };
  }
  // Apply intoxication effect
  const { error: effectError } = await supabase
    .from("player_active_effects")
    .insert({
      game_code: gameCode,
      target_player_id: targetPlayerId,
      source_player_id: actorPlayerId,
      source_role_name: "Intoxication",
      effect_type: "Hospitalize",
      day_applied: dayNumber,
      duration_days: 1,
      expires_at_day: dayNumber + 1,
    });
  if (effectError) throw effectError;
  // Update target status
  const { error: statusError } = await supabase
    .from("players")
    .update({
      status: "Hospitalized",
    })
    .eq("player_id", targetPlayerId);
  if (statusError) throw statusError;
  // Deduct points
  const { error: pointsError } = await supabase
    .from("players")
    .update({
      personal_points: actorPoints - requiredPoints,
    })
    .eq("player_id", actorPlayerId);
  if (pointsError) throw pointsError;
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameCode,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Intoxication",
    action_type: "Hospitalize",
    target_player_id: targetPlayerId,
    points_spent: requiredPoints,
    action_successful: true,
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: "Target hospitalized successfully",
  };
}
export async function justiceKill(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number,
  yValue: number,
  actorPoints: number
) {
  const requiredPoints = 2 * yValue;
  if (actorPoints < requiredPoints) {
    return {
      success: false,
      message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}`,
    };
  }
  // Validate target
  const { data: targetPlayer } = await supabase
    .from("players")
    .select("player_id, status")
    .eq("player_id", targetPlayerId)
    .eq("game_code", gameCode)
    .single();
  if (!targetPlayer || targetPlayer.status !== "Alive") {
    return {
      success: false,
      message: "Invalid target or target is not alive",
    };
  }
  // Execute kill (Justice kill bypasses protection)
  const { error: killError } = await supabase
    .from("players")
    .update({
      status: "Dead",
    })
    .eq("player_id", targetPlayerId);
  if (killError) throw killError;
  // Deduct points
  const { error: pointsError } = await supabase
    .from("players")
    .update({
      personal_points: actorPoints - requiredPoints,
    })
    .eq("player_id", actorPlayerId);
  if (pointsError) throw pointsError;
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameCode,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Justice",
    action_type: "Kill",
    target_player_id: targetPlayerId,
    points_spent: requiredPoints,
    action_successful: true,
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: "Justice kill executed successfully",
  };
}
export async function justiceProtect(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number,
  yValue: number,
  actorPoints: number
) {
  const requiredPoints = yValue;
  if (actorPoints < requiredPoints) {
    return {
      success: false,
      message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}`,
    };
  }
  // Validate target
  const { data: targetPlayer } = await supabase
    .from("players")
    .select("player_id, status")
    .eq("player_id", targetPlayerId)
    .eq("game_code", gameCode)
    .single();
  if (!targetPlayer || targetPlayer.status !== "Alive") {
    return {
      success: false,
      message: "Invalid target or target is not alive",
    };
  }
  // Apply protection
  const { error: protectionError } = await supabase
    .from("player_protections")
    .insert({
      game_code: gameCode,
      day_number: dayNumber,
      protector_player_id: actorPlayerId,
      protected_player_id: targetPlayerId,
      protection_type: "murder_intoxication",
      expires_at_day: dayNumber + 1,
    });
  if (protectionError) throw protectionError;
  // Deduct points
  const { error: pointsError } = await supabase
    .from("players")
    .update({
      personal_points: actorPoints - requiredPoints,
    })
    .eq("player_id", actorPlayerId);
  if (pointsError) throw pointsError;
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameCode,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Justice",
    action_type: "Protect",
    target_player_id: targetPlayerId,
    points_spent: requiredPoints,
    action_successful: true,
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: "Protection applied successfully",
  };
}
export async function executeEnvySwap(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number,
  yValue: number,
  actorPoints: number
) {
  const requiredPoints = yValue;
  if (actorPoints < requiredPoints) {
    return {
      success: false,
      message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}`,
    };
  }
  // Validate target
  const { data: targetPlayer } = await supabase
    .from("players")
    .select("player_id, status")
    .eq("player_id", targetPlayerId)
    .eq("game_code", gameCode)
    .single();
  if (!targetPlayer || targetPlayer.status !== "Alive") {
    return {
      success: false,
      message: "Invalid target or target is not alive",
    };
  }
  // Swap identities for voting purposes
  const { error: swapError1 } = await supabase
    .from("players")
    .update({
      effective_identity_player_id: targetPlayerId,
    })
    .eq("player_id", actorPlayerId);
  if (swapError1) throw swapError1;
  const { error: swapError2 } = await supabase
    .from("players")
    .update({
      effective_identity_player_id: actorPlayerId,
    })
    .eq("player_id", targetPlayerId);
  if (swapError2) throw swapError2;
  // Deduct points
  const { error: pointsError } = await supabase
    .from("players")
    .update({
      personal_points: actorPoints - requiredPoints,
    })
    .eq("player_id", actorPlayerId);
  if (pointsError) throw pointsError;
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameCode,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Envy",
    action_type: "SwapIdentity",
    target_player_id: targetPlayerId,
    points_spent: requiredPoints,
    action_successful: true,
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: "Identity swap executed successfully",
  };
}
export async function certaintySeePlayersInTier(
  gameCode: string,
  actorPlayerId: string,
  targetTier: RoleTier,
  dayNumber: number,
  yValue: number,
  actorPoints: number
) {
  const tierMultipliers = {
    S: 3.5,
    A: 3.0,
    B: 2.5,
    C: 2.0,
    D: 1.0,
  };
  const requiredPoints = Math.floor(yValue * tierMultipliers[targetTier]);
  if (actorPoints < requiredPoints) {
    return {
      success: false,
      message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}`,
    };
  }
  // Get players in the specified tier
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select(
      `
      player_id,
      player_name,
      current_role_name,
      roles!players_current_role_name_fkey(tier)
    `
    )
    .eq("game_code", gameCode)
    .eq("status", "Alive");
  if (playersError) throw playersError;
  const playersInTier =
    players
      ?.filter((player) => player.roles?.tier === targetTier)
      .map((player) => ({
        player_id: player.player_id,
        player_name: player.player_name,
        role_name: player.current_role_name,
      })) || [];
  // Deduct points
  const { error: pointsError } = await supabase
    .from("players")
    .update({
      personal_points: actorPoints - requiredPoints,
    })
    .eq("player_id", actorPlayerId);
  if (pointsError) throw pointsError;
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameCode,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Certainty",
    action_type: "RevealTierPlayers",
    target_tier: targetTier,
    points_spent: requiredPoints,
    action_successful: true,
    action_details: {
      revealed_players: playersInTier,
    },
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: `Players in tier ${targetTier} revealed`,
    data: {
      players: playersInTier,
    },
  };
}
export async function executeTorment(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
) {
  // Validate target
  const { data: targetPlayer } = await supabase
    .from("players")
    .select("player_id, status")
    .eq("player_id", targetPlayerId)
    .eq("game_code", gameCode)
    .single();
  if (!targetPlayer || targetPlayer.status !== "Alive") {
    return {
      success: false,
      message: "Invalid target or target is not alive",
    };
  }
  // Apply torment effect for minigame
  const { error: effectError } = await supabase
    .from("player_active_effects")
    .insert({
      game_code: gameCode,
      target_player_id: targetPlayerId,
      source_player_id: actorPlayerId,
      source_role_name: "Torment",
      effect_type: "MiniGameDisrupt",
      day_applied: dayNumber,
      duration_days: 1,
      expires_at_day: dayNumber + 1,
    });
  if (effectError) throw effectError;
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameCode,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Torment",
    action_type: "MiniGameDisrupt",
    target_player_id: targetPlayerId,
    points_spent: 0,
    action_successful: true,
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: "Torment effect applied successfully",
  };
}
export async function executeSacrifice(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
) {
  // Validate target
  const { data: targetPlayer } = await supabase
    .from("players")
    .select("player_id, status")
    .eq("player_id", targetPlayerId)
    .eq("game_code", gameCode)
    .single();
  if (!targetPlayer || targetPlayer.status !== "Alive") {
    return {
      success: false,
      message: "Invalid target or target is not alive",
    };
  }
  // Kill both actor and target
  const { error: killError } = await supabase
    .from("players")
    .update({
      status: "Dead",
    })
    .in("player_id", [actorPlayerId, targetPlayerId]);
  if (killError) throw killError;
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameCode,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Sacrifice",
    action_type: "SacrificeWithTarget",
    target_player_id: targetPlayerId,
    points_spent: 0,
    action_successful: true,
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: "Sacrifice executed successfully",
  };
}
export async function executeVengeanceGuess(
  gameCode: string,
  actorPlayerId: string,
  imprisonedPlayerId: string,
  guessedVoterId: string,
  dayNumber: number,
  yValue: number,
  actorPoints: number
) {
  const requiredPoints = yValue;
  if (actorPoints < requiredPoints) {
    return {
      success: false,
      message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}`,
    };
  }
  // Validate imprisoned player
  const { data: imprisonedPlayer } = await supabase
    .from("players")
    .select("player_id, status")
    .eq("player_id", imprisonedPlayerId)
    .eq("game_code", gameCode)
    .single();
  if (!imprisonedPlayer || imprisonedPlayer.status !== "Imprisoned") {
    return {
      success: false,
      message: "Target player is not imprisoned",
    };
  }
  // Check if the guess is correct (from previous day's voting)
  const { data: vote } = await supabase
    .from("game_votes")
    .select("voter_player_id")
    .eq("game_code", gameCode)
    .eq("voted_player_id", imprisonedPlayerId)
    .eq("voter_player_id", guessedVoterId)
    .eq("day_number", dayNumber - 1)
    .single();
  const isCorrect = !!vote;
  // If correct, hospitalize the voter
  if (isCorrect) {
    const { error: effectError } = await supabase
      .from("player_active_effects")
      .insert({
        game_code: gameCode,
        target_player_id: guessedVoterId,
        source_player_id: actorPlayerId,
        source_role_name: "Vengeance",
        effect_type: "Hospitalize",
        day_applied: dayNumber,
        duration_days: 1,
        expires_at_day: dayNumber + 1,
      });
    if (effectError) throw effectError;
    // Update voter status
    const { error: statusError } = await supabase
      .from("players")
      .update({
        status: "Hospitalized",
      })
      .eq("player_id", guessedVoterId);
    if (statusError) throw statusError;
  }
  // Log the vengeance guess
  const { error: guessError } = await supabase
    .from("vengeance_guesses")
    .insert({
      game_code: gameCode,
      day_number: dayNumber,
      vengeance_player_id: actorPlayerId,
      imprisoned_player_id: imprisonedPlayerId,
      guessed_voter_id: guessedVoterId,
      is_correct: isCorrect,
    });
  if (guessError) throw guessError;
  // Deduct points
  const { error: pointsError } = await supabase
    .from("players")
    .update({
      personal_points: actorPoints - requiredPoints,
    })
    .eq("player_id", actorPlayerId);
  if (pointsError) throw pointsError;
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameCode,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Vengeance",
    action_type: "GuessVoterForHospitalization",
    target_player_id: imprisonedPlayerId,
    secondary_target_id: guessedVoterId,
    points_spent: requiredPoints,
    action_successful: isCorrect,
    action_details: {
      is_correct: isCorrect,
    },
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: isCorrect
      ? "Correct guess! Voter hospitalized."
      : "Incorrect guess.",
    data: {
      is_correct: isCorrect,
    },
  };
}

export async function executeTruthfulnessReveal(
  gameId: string,
  dayNumber: number,
  actorPlayerId: string,
  imprisonedPlayerId: string,
  yValue: number,
  actorPoints: number
) {
  const requiredPoints = 2 * yValue;
  if (actorPoints < requiredPoints) {
    return {
      success: false,
      message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}`,
    };
  }
  const { error: pointsError } = await supabase
    .from("players")
    .update({
      personal_points: actorPoints - requiredPoints,
    })
    .eq("player_id", actorPlayerId);
  if (pointsError) throw pointsError;
  // Log action
  const { error: actionError } = await supabase.from("player_actions").insert({
    game_code: gameId,
    day_number: dayNumber,
    acting_player_id: actorPlayerId,
    acting_role_name: "Truthfulness",
    action_type: "RevealAllVotesOnImprisoned",
    target_player_id: imprisonedPlayerId,
    points_spent: requiredPoints,
    action_successful: true,
  });
  if (actionError) throw actionError;
  return {
    success: true,
    message: "Vote information revealed to all players",
  };
}

//
// Utility functions
//
export async function getPlayerActiveEffects(
  gameCode: string,
  playerId: string,
  currentDay: number
) {
  const { data: effects } = await supabase
    .from("player_active_effects")
    .select("*")
    .eq("game_code", gameCode)
    .eq("target_player_id", playerId)
    .gte("expires_at_day", currentDay);

  return effects || [];
}

export async function isPlayerHospitalized(
  gameCode: string,
  playerId: string,
  currentDay: number
): Promise<boolean> {
  const effects = await getPlayerActiveEffects(gameCode, playerId, currentDay);
  return effects.some((effect) => effect.effect_type === "Hospitalize");
}

export async function hasInkSpotEffect(
  gameCode: string,
  playerId: string,
  currentDay: number
): Promise<boolean> {
  const effects = await getPlayerActiveEffects(gameCode, playerId, currentDay);
  return effects.some((effect) => effect.effect_type === "MiniGameDisrupt");
}

export async function getPlayerProtections(
  gameCode: string,
  playerId: string,
  currentDay: number
) {
  const { data: protections } = await supabase
    .from("player_protections")
    .select("*")
    .eq("game_code", gameCode)
    .eq("protected_player_id", playerId)
    .gte("expires_at_day", currentDay);

  return protections || [];
}

export async function isPlayerProtected(
  gameCode: string,
  playerId: string,
  currentDay: number,
  protectionType: string = "murder_intoxication"
): Promise<boolean> {
  const protections = await getPlayerProtections(
    gameCode,
    playerId,
    currentDay
  );
  return protections.some(
    (protection) => protection.protection_type === protectionType
  );
}

export function calculateRoleCost(roleName: string, yValue: number): number {
  const roleCosts: Record<string, number> = {
    Murder: yValue,
    Empathy: 0,
    Intoxication: yValue,
    Justice_Kill: 2 * yValue,
    Justice_Protect: yValue,
    Envy: yValue,
    Certainty_S: yValue * 3.5,
    Certainty_A: yValue * 3.0,
    Certainty_B: yValue * 2.5,
    Certainty_C: yValue * 2.0,
    Certainty_D: yValue * 1.0,
    Torment: 0,
    Sacrifice: 0,
    Vengeance: yValue,
    Truthfulness: 2 * yValue,
  };

  return roleCosts[roleName] || 0;
}
