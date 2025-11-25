export type RoundType = 'official' | 'training';

export interface GolfRound {
  id: string;
  date: string;
  courseName: string;
  courseRating: number;
  slopeRating: number;
  score: number;
  par: number;
  roundType: RoundType;
  differentialScore?: number;
  notes?: string;
}

export interface HandicapHistory {
  date: string;
  handicap: number;
  roundsPlayed: number;
}
