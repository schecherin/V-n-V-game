// packages/client/lib/types.ts
// (Same as before - defines Player, GameState, Role, Team etc.)

export type GamePhase = 'PRE_GAME' | 'ROLE_REVEAL' | 'REFLECTION' | 'OUTREACH' | 'CONSULTATION' | 'GAME_OVER'; // Added ROLE_REVEAL if needed server-side
export type PlayerStatus = 'ALIVE' | 'IMPRISONED' | 'DEAD';
export type Team = 'VICES' | 'VIRTUES';
export type Role =
  | 'PENDING_OFFICER'
  | 'VIRTUE_DEFAULT'
  | 'VICE_DEFAULT'
  | 'CHAIRMAN'
  | 'SECRETARY'
  | 'TREASURER'
  | 'DETECTIVE' // Example specific role (add others based on full spec)
  | 'DOCTOR'    // Example specific role
  | 'MAFIOSO'   // Example specific role
  | 'DISINFORMER' // Example specific role
  | 'HOUSE_BUILDER'; // Example specific role

export interface Player {
  id: string;
  socketId?: string; // Keep socketId optional here
  name: string;
  status: PlayerStatus;
  role?: Role;
  team?: Team;
  points: number;
  isCurrentUser: boolean;
  gameId: string;
  // Add role description maybe?
  roleDescription?: string;
}

export interface GameState {
  gameId: string;
  phase: GamePhase;
  players: Player[];
  dayNumber: number;
  timerEndTime?: number;
  officers: {
    chairman: string | null;
    secretary: string | null;
    treasurer: string | null;
  };
  housesBuilt: number;
  allowOutreachPhase: boolean;
  gameLog?: string[]; // Optional here, managed separately in GamePage state
  winnerTeam?: Team | null;
  // Add other relevant game state properties
}

// Add more specific types as needed