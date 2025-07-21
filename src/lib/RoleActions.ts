import { supabase } from "@/lib/supabase/client";
import { getPlayerById, fetchPlayerPoints } from "@/lib/playerApi";
import { getGameByCode } from "@/lib/gameApi";

export type RoleTier = 'S' | 'A' | 'B' | 'C' | 'D';
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


// Murder role actions
export async function executeMurder(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    const game = await getGameByCode(gameCode);
    const yValue = game.max_points_per_day_m;
    const requiredPoints = yValue;
    
    const actorPoints = await fetchPlayerPoints(actorPlayerId);
    
    if (actorPoints < requiredPoints) {
      return { 
        success: false, 
        message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}` 
      };
    }

    // Check if target is protected
    const { data: protection } = await supabase
      .from('player_protections')
      .select('*')
      .eq('game_code', gameCode)
      .eq('protected_player_id', targetPlayerId)
      .eq('protection_type', 'murder_intoxication')
      .gte('expires_at_day', dayNumber)
      .single();

    if (protection) {
      return { 
        success: false, 
        message: 'Target is protected from murder' 
      };
    }

    // Execute murder
    await supabase.from('players').update({ 
      status: 'Dead' 
    }).eq('player_id', targetPlayerId);

    // Deduct points and log action
    await supabase.from('players').update({ 
      personal_points: actorPoints - requiredPoints 
    }).eq('player_id', actorPlayerId);

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Murder',
      action_type: 'Kill', // Changed from 'murder' to 'Kill'
      target_player_id: targetPlayerId,
      points_spent: requiredPoints
    });

    return { success: true, message: 'Murder executed successfully' };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}
export async function murderSelectSuccessor(
  gameCode: string,
  murderPlayerId: string,
  successorPlayerId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    // Update successor to have Murder role
    await supabase.from('players').update({ 
      current_role_name: 'Murder',
      role_inherited_from: murderPlayerId 
    }).eq('player_id', successorPlayerId);

    await supabase.from('role_inheritance_choices').insert({
      game_code: gameCode,
      day_number: dayNumber,
      deceased_player_id: murderPlayerId,
      deceased_role_name: 'Murder',
      inheritor_player_id: successorPlayerId,
      original_inheritor_role_name: 'Vice'
    });

    return { success: true, message: 'Successor selected successfully' };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}





// Empathy role actions
export async function empathyViewVotes(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    const { data: votes } = await supabase
      .from('game_votes')
      .select(`
        voter_player_id,
        players!game_votes_voter_player_id_fkey(player_name)
      `)
      .eq('game_code', gameCode)
      .eq('voted_player_id', targetPlayerId)
      .eq('day_number', dayNumber);

    const voterInfo = votes?.map(vote => ({
      voter_player_id: vote.voter_player_id,
      voter_name: (vote.players as any)?.player_name || 'Unknown'
    })) || [];

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Empathy',
      action_type: 'RevealVotesOnTarget', // Changed from 'empathy_view' to 'RevealVotesOnTarget'
      target_player_id: targetPlayerId,
      points_spent: 0,
      action_details: { voters: voterInfo }
    });

    return { 
      success: true, 
      message: 'Vote information retrieved', 
      data: { voters: voterInfo }
    };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}





// Intoxication role actions
export async function executeIntoxication(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    const game = await getGameByCode(gameCode);
    const yValue = game.max_points_per_day_m;
    const requiredPoints = yValue;
    
    const actorPoints = await fetchPlayerPoints(actorPlayerId);
    
    if (actorPoints < requiredPoints) {
      return { 
        success: false, 
        message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}` 
      };
    }

    // Check if target is protected
    const { data: protection } = await supabase
      .from('player_protections')
      .select('*')
      .eq('game_code', gameCode)
      .eq('protected_player_id', targetPlayerId)
      .eq('protection_type', 'murder_intoxication')
      .gte('expires_at_day', dayNumber)
      .single();

    if (protection) {
      return { 
        success: false, 
        message: 'Target is protected from intoxication' 
      };
    }

    // Apply intoxication effect
    await supabase.from('player_active_effects').insert({
      game_code: gameCode,
      target_player_id: targetPlayerId,
      source_player_id: actorPlayerId,
      source_role_name: 'Intoxication',
      effect_type: 'Hospitalize', // Changed from 'hospitalized' to 'Hospitalize'
      day_applied: dayNumber,
      duration_days: 1,
      expires_at_day: dayNumber + 1
    });

    // Deduct points and log action
    await supabase.from('players').update({ 
      personal_points: actorPoints - requiredPoints 
    }).eq('player_id', actorPlayerId);

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Intoxication',
      action_type: 'Hospitalize', // Changed from 'intoxication' to 'Hospitalize'
      target_player_id: targetPlayerId,
      points_spent: requiredPoints
    });

    return { success: true, message: 'Target hospitalized successfully' };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}





// Justice role actions
export async function justiceKill(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    const game = await getGameByCode(gameCode);
    const yValue = game.max_points_per_day_m;
    const requiredPoints = 2 * yValue;
    
    const actorPoints = await fetchPlayerPoints(actorPlayerId);
    
    if (actorPoints < requiredPoints) {
      return { 
        success: false, 
        message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}` 
      };
    }

    // Execute kill (Justice kill bypasses protection)
    await supabase.from('players').update({ 
      status: 'Dead' 
    }).eq('player_id', targetPlayerId);

    // Deduct points and log action
    await supabase.from('players').update({ 
      personal_points: actorPoints - requiredPoints 
    }).eq('player_id', actorPlayerId);

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Justice',
      action_type: 'Kill', // Changed from 'justice_kill' to 'Kill'
      target_player_id: targetPlayerId,
      points_spent: requiredPoints
    });

    return { success: true, message: 'Justice kill executed successfully' };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}
export async function justiceProtect(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    const game = await getGameByCode(gameCode);
    const yValue = game.max_points_per_day_m;
    const requiredPoints = yValue;
    
    const actorPoints = await fetchPlayerPoints(actorPlayerId);
    
    if (actorPoints < requiredPoints) {
      return { 
        success: false, 
        message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}` 
      };
    }

    // Apply protection
    await supabase.from('player_protections').insert({
      game_code: gameCode,
      day_number: dayNumber,
      protector_player_id: actorPlayerId,
      protected_player_id: targetPlayerId,
      protection_type: 'murder_intoxication',
      expires_at_day: dayNumber + 1
    });

    // Deduct points and log action
    await supabase.from('players').update({ 
      personal_points: actorPoints - requiredPoints 
    }).eq('player_id', actorPlayerId);

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Justice',
      action_type: 'Protect', // Changed from 'justice_protect' to 'Protect'
      target_player_id: targetPlayerId,
      points_spent: requiredPoints
    });

    return { success: true, message: 'Protection applied successfully' };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}






// Envy role actions
export async function executeEnvySwap(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    const game = await getGameByCode(gameCode);
    const yValue = game.max_points_per_day_m;
    const requiredPoints = yValue;
    
    const actorPoints = await fetchPlayerPoints(actorPlayerId);
    
    if (actorPoints < requiredPoints) {
      return { 
        success: false, 
        message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}` 
      };
    }

    // Swap identities for voting purposes
    await supabase.from('players').update({ 
      effective_identity_player_id: targetPlayerId 
    }).eq('player_id', actorPlayerId);

    await supabase.from('players').update({ 
      effective_identity_player_id: actorPlayerId 
    }).eq('player_id', targetPlayerId);

    // Deduct points and log action
    await supabase.from('players').update({ 
      personal_points: actorPoints - requiredPoints 
    }).eq('player_id', actorPlayerId);

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Envy',
      action_type: 'SwapIdentity', // Changed from 'envy_swap' to 'SwapIdentity'
      target_player_id: targetPlayerId,
      points_spent: requiredPoints
    });

    return { success: true, message: 'Identity swap executed successfully' };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}






// Certainty role actions
export async function certaintySeePlayersInTier(
  gameCode: string,
  actorPlayerId: string,
  targetTier: RoleTier,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    const game = await getGameByCode(gameCode);
    const yValue = game.max_points_per_day_m;
    
    const tierMultipliers = {
      'S': 3.5,
      'A': 3.0,
      'B': 2.5,
      'C': 2.0,
      'D': 1.0
    };
    
    const requiredPoints = yValue * tierMultipliers[targetTier];
    const actorPoints = await fetchPlayerPoints(actorPlayerId);
    
    if (actorPoints < requiredPoints) {
      return { 
        success: false, 
        message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}` 
      };
    }

    // Get players in the specified tier
    const { data: players } = await supabase
      .from('players')
      .select(`
        player_id,
        player_name,
        current_role_name,
        roles!players_current_role_name_fkey(tier)
      `)
      .eq('game_code', gameCode)
      .eq('status', 'Alive');

    const playersInTier = players?.filter(player => 
      (player.roles as any)?.tier === targetTier
    ).map(player => ({
      player_id: player.player_id,
      player_name: player.player_name,
      role_name: player.current_role_name
    })) || [];

    // Deduct points and log action
    await supabase.from('players').update({ 
      personal_points: actorPoints - requiredPoints 
    }).eq('player_id', actorPlayerId);

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Certainty',
      action_type: 'RevealTierPlayers', // Changed from 'certainty_reveal' to 'RevealTierPlayers'
      target_tier: targetTier,
      points_spent: requiredPoints,
      action_details: { revealed_players: playersInTier }
    });

    return { 
      success: true, 
      message: `Players in tier ${targetTier} revealed`, 
      data: { players: playersInTier }
    };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}




// Torment role actions
export async function executeTorment(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    // Apply torment effect for minigame
    await supabase.from('player_active_effects').insert({
      game_code: gameCode,
      target_player_id: targetPlayerId,
      source_player_id: actorPlayerId,
      source_role_name: 'Torment',
      effect_type: 'MiniGameDisrupt', // Changed from 'ink_spots' to 'MiniGameDisrupt'
      day_applied: dayNumber,
      duration_days: 1,
      expires_at_day: dayNumber + 1
    });

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Torment',
      action_type: 'MiniGameDisrupt', // Changed from 'torment' to 'MiniGameDisrupt'
      target_player_id: targetPlayerId,
      points_spent: 0
    });

    return { success: true, message: 'Torment effect applied successfully' };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}





// Sacrifice role actions
export async function executeSacrifice(
  gameCode: string,
  actorPlayerId: string,
  targetPlayerId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    // Kill both actor and target
    await supabase.from('players').update({ 
      status: 'Dead' 
    }).in('player_id', [actorPlayerId, targetPlayerId]);

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Sacrifice',
      action_type: 'SacrificeWithTarget', // Changed from 'sacrifice' to 'SacrificeWithTarget'
      target_player_id: targetPlayerId,
      points_spent: 0
    });

    return { success: true, message: 'Sacrifice executed successfully' };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}





// Vengeance role actions
export async function executeVengeanceGuess(
  gameCode: string,
  actorPlayerId: string,
  imprisonedPlayerId: string,
  guessedVoterId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    const game = await getGameByCode(gameCode);
    const yValue = game.max_points_per_day_m;
    const requiredPoints = yValue;
    
    const actorPoints = await fetchPlayerPoints(actorPlayerId);
    
    if (actorPoints < requiredPoints) {
      return { 
        success: false, 
        message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}` 
      };
    }

    // Check if the guess is correct
    const { data: vote } = await supabase
      .from('game_votes')
      .select('voter_player_id')
      .eq('game_code', gameCode)
      .eq('voted_player_id', imprisonedPlayerId)
      .eq('voter_player_id', guessedVoterId)
      .eq('day_number', dayNumber)
      .single();

    const isCorrect = !!vote;

    // If correct, hospitalize the voter
    if (isCorrect) {
      await supabase.from('player_active_effects').insert({
        game_code: gameCode,
        target_player_id: guessedVoterId,
        source_player_id: actorPlayerId,
        source_role_name: 'Vengeance',
        effect_type: 'Hospitalize', // Changed from 'hospitalized' to 'Hospitalize'
        day_applied: dayNumber,
        duration_days: 1,
        expires_at_day: dayNumber + 1
      });
    }

    // Log the vengeance guess
    await supabase.from('vengeance_guesses').insert({
      game_code: gameCode,
      day_number: dayNumber,
      vengeance_player_id: actorPlayerId,
      imprisoned_player_id: imprisonedPlayerId,
      guessed_voter_id: guessedVoterId,
      is_correct: isCorrect
    });

    // Deduct points and log action
    await supabase.from('players').update({ 
      personal_points: actorPoints - requiredPoints 
    }).eq('player_id', actorPlayerId);

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Vengeance',
      action_type: 'GuessVoterForHospitalization', // Changed from 'vengeance_guess' to 'GuessVoterForHospitalization'
      target_player_id: imprisonedPlayerId,
      secondary_target_id: guessedVoterId,
      points_spent: requiredPoints,
      action_details: { is_correct: isCorrect }
    });

    return { 
      success: true, 
      message: isCorrect ? 'Correct guess! Voter hospitalized.' : 'Incorrect guess.',
      data: { is_correct: isCorrect }
    };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}





// Truthfulness role actions
export async function executeTruthfulnessReveal(
  gameCode: string,
  actorPlayerId: string,
  dayNumber: number
): Promise<RoleActionResult> {
  try {
    const game = await getGameByCode(gameCode);
    const yValue = game.max_points_per_day_m;
    const requiredPoints = 2 * yValue;
    
    const actorPoints = await fetchPlayerPoints(actorPlayerId);
    
    if (actorPoints < requiredPoints) {
      return { 
        success: false, 
        message: `Insufficient points. Need ${requiredPoints}, have ${actorPoints}` 
      };
    }

    // Get the most recent voting round results
    const { data: votes } = await supabase
      .from('game_votes')
      .select(`
        voter_player_id,
        voted_player_id,
        players!game_votes_voter_player_id_fkey(player_name),
        voted_player:players!game_votes_voted_player_id_fkey(player_name)
      `)
      .eq('game_code', gameCode)
      .eq('day_number', dayNumber)
      .order('created_at', { ascending: false });

    // Get who was actually voted out (most votes)
    const voteCounts: Record<string, number> = {};
    votes?.forEach(vote => {
      voteCounts[vote.voted_player_id] = (voteCounts[vote.voted_player_id] || 0) + 1;
    });

    const votedOutPlayerId = Object.entries(voteCounts).reduce((a, b) => 
      voteCounts[a[0]] > voteCounts[b[0]] ? a : b
    )?.[0];

    const votersForVotedOut = votes?.filter(vote => 
      vote.voted_player_id === votedOutPlayerId
    ).map(vote => ({
      voter_id: vote.voter_player_id,
      voter_name: (vote.players as any)?.player_name || 'Unknown'
    })) || [];

    // Deduct points and log action
    await supabase.from('players').update({ 
      personal_points: actorPoints - requiredPoints 
    }).eq('player_id', actorPlayerId);

    await supabase.from('player_actions').insert({
      game_code: gameCode,
      day_number: dayNumber,
      acting_player_id: actorPlayerId,
      acting_role_name: 'Truthfulness',
      action_type: 'RevealAllVotesOnImprisoned', // Changed from 'truthfulness_reveal' to 'RevealAllVotesOnImprisoned'
      points_spent: requiredPoints,
      action_details: { 
        voted_out_player_id: votedOutPlayerId,
        voters: votersForVotedOut
      }
    });

    return { 
      success: true, 
      message: 'Vote information revealed to all players', 
      data: { voters: votersForVotedOut }
    };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}








// Utility functions
export async function getPlayerActiveEffects(
  gameCode: string, 
  playerId: string, 
  currentDay: number
) {
  const { data: effects } = await supabase
    .from('player_active_effects')
    .select('*')
    .eq('game_code', gameCode)
    .eq('target_player_id', playerId)
    .gte('expires_at_day', currentDay);
  
  return effects || [];
}

export async function isPlayerHospitalized(
  gameCode: string, 
  playerId: string, 
  currentDay: number
): Promise<boolean> {
  const effects = await getPlayerActiveEffects(gameCode, playerId, currentDay);
  return effects.some(effect => effect.effect_type === 'Hospitalize'); // Changed from 'hospitalized' to 'Hospitalize'
}

export async function hasInkSpotEffect(
  gameCode: string, 
  playerId: string, 
  currentDay: number
): Promise<boolean> {
  const effects = await getPlayerActiveEffects(gameCode, playerId, currentDay);
  return effects.some(effect => effect.effect_type === 'MiniGameDisrupt'); // Changed from 'ink_spots' to 'MiniGameDisrupt'
}

export async function getPlayerProtections(
  gameCode: string, 
  playerId: string, 
  currentDay: number
) {
  const { data: protections } = await supabase
    .from('player_protections')
    .select('*')
    .eq('game_code', gameCode)
    .eq('protected_player_id', playerId)
    .gte('expires_at_day', currentDay);
  
  return protections || [];
}

export async function isPlayerProtected(
  gameCode: string, 
  playerId: string, 
  currentDay: number,
  protectionType: string = 'murder_intoxication'
): Promise<boolean> {
  const protections = await getPlayerProtections(gameCode, playerId, currentDay);
  return protections.some(protection => protection.protection_type === protectionType);
}


// Role cost calculation
export function calculateRoleCost(roleName: string, yValue: number): number {
  const roleCosts: Record<string, number> = {
    'Murder': yValue,
    'Empathy': 0,
    'Intoxication': yValue,
    'Justice_Kill': 2 * yValue,
    'Justice_Protect': yValue,
    'Envy': yValue,
    'Certainty_S': yValue * 3.5,
    'Certainty_A': yValue * 3.0,
    'Certainty_B': yValue * 2.5,
    'Certainty_C': yValue * 2.0,
    'Certainty_D': yValue * 1.0,
    'Torment': 0,
    'Sacrifice': 0,
    'Vengeance': yValue,
    'Truthfulness': 2 * yValue
  };
  
  return roleCosts[roleName] || 0;
}