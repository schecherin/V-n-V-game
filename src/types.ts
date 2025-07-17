import { Database, Tables, Enums } from "./database.types";

// ENUMS
export type GamePhase = Enums<"game_phase">;
export type PlayerState = Enums<"player_status">;
export type Team = Enums<"role_faction">;

// TABLES
export type Player = Tables<"players">;
export type Game = Tables<"games">;

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
