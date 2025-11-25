export interface GolfRound {
  id: string;
  date: string;
  courseName: string;
  courseRating: number;
  slopeRating: number;
  score: number;
  par: number;
  differentialScore?: number;
}

export interface HandicapHistory {
  date: string;
  handicap: number;
  roundsPlayed: number;
}
