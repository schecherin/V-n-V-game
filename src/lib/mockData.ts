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

export type ActiveView = "players" | "controls";
