import { Database, Tables, Enums } from "./database.types";

// ENUMS
export type GamePhase = Enums<"game_phase">;
export type PlayerState = Enums<"player_status">;
export type Team = Enums<"role_faction">;
export type RoleTier = Enums<"role_tier">;
export type AbilityEffectType = Enums<"ability_effect_type">;
export type AbilityTargetType = Enums<"ability_target_type">;
export type ChatChannelType = Enums<"chat_channel_type">;
export type TreasuryActionType = Enums<"treasury_action_type">;



// TABLES
export type Player = Tables<"players">;
export type Game = Tables<"games">;
export type Role = Tables<"roles">;
export type GameEvent = Tables<"game_events">;
export type GameVote = Tables<"game_votes">;

export type PlayerAction = Tables<"player_actions">;
export type PlayerActiveEffect = Tables<"player_active_effects">;
export type PlayerProtection = Tables<"player_protections">;
export type ReflectionPhaseGuess = Tables<"reflection_phase_guesses">;
export type RoleConversion = Tables<"role_conversions">;
export type RoleInheritanceChoice = Tables<"role_inheritance_choices">;
export type SecretaryVoteAnnouncement = Tables<"secretary_vote_announcements">;
export type TreasuryTransaction = Tables<"treasury_transactions">;
export type VengeanceGuess = Tables<"vengeance_guesses">;


// Insert types for making new stuff in
export type GameData = Database["public"]["Tables"]["games"]["Insert"];
export type PlayerData = Database["public"]["Tables"]["players"]["Insert"];

/**
 * Represents a toggleable game switch (e.g., for host controls UI)
 */
export interface GameSwitch {
  id: string;
  label: string;
  checked: boolean;
}



