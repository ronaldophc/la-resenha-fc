export interface Standing {
  id: number;
  championship: string;
  teamName: string;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  createdAt: Date;
  updatedAt: Date;
}
