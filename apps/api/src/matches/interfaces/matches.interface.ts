export interface Match {
  id: number;
  date: Date;
  opponent: string;
  location: string;
  homeScore: number;
  awayScore: number;
  championship: string | null;
  createdAt: Date;
  updatedAt: Date;
}
