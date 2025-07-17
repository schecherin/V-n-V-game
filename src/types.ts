import { Database, Tables, Enums } from "./database.types";

// ENUMS
export type GamePhase = Enums<"game_phase">;
export type PlayerState = Enums<"player_status">;
export type Team = Enums<"role_faction">;

// TABLES
export type Player = Tables<"players">;
export type Game = Tables<"games">;
