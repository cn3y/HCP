export type RoundType = 'official' | 'training';
export type RoundFormat = '9' | '18';

export interface GolfRound {
  id: string;
  date: string;
  courseName: string;
  courseRating: number;
  slopeRating: number;
  score: number;
  par: number;
  holes: RoundFormat;
  roundType: RoundType;
  differentialScore?: number;
  notes?: string;
}

export interface PlayerProfile {
  name: string;
  handicapIndex: number;
  startDate: string;
  startHandicap: number;
}

export interface HandicapHistory {
  date: string;
  handicap: number;
  roundsPlayed: number;
}
