
export interface Player {
  id: number;
  username: string;
  isReady: boolean;
  isHost: boolean;
}

export const mockPlayers: Player[] = Array.from({ length: 15 }, (_, i): Player => {
  const playerNumber = i + 1;
  return {
    id: playerNumber,
    username: `Player ${playerNumber}`,
    isReady: i % 3 === 0,
    isHost: i === 0,
  };
});

export const initialRoomName: string = "Vice & Virtue - Test";

export interface UserGameData {
  role: string;
  roleDescription: string;
  points: number;
  totalPoints: number;
}

export const mockUserGameData: UserGameData = {
role: "Role", 
roleDescription: "Role description", 
  points: 125,
  totalPoints: 550,
};

export interface PhaseSwitch {
    id: string;
    label: string;
    checked: boolean;
}
export type ActiveView = 'players' | 'controls';