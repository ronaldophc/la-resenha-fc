export enum PlayerPosition {
  GOALKEEPER = 'GOALKEEPER',
  DEFENDER = 'DEFENDER',
  MIDFIELDER = 'MIDFIELDER',
  FORWARD = 'FORWARD',
}

export interface Player {
  id: number;
  name: string;
  number: number;
  position: PlayerPosition;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
