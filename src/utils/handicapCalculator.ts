import type { GolfRound, HandicapHistory } from '../types';

/**
 * Calculates the Score Differential for a round
 * Formula: (113 / Slope Rating) × (Adjusted Gross Score - Course Rating)
 */
export function calculateDifferential(round: GolfRound): number {
  const differential = (113 / round.slopeRating) * (round.score - round.courseRating);
  return Math.round(differential * 10) / 10;
}

/**
 * Calculates the Handicap Index based on the best rounds
 * IMPORTANT: Only official rounds are considered!
 * Simplified WHS method:
 * - 1-5 rounds: best 1
 * - 6-8 rounds: best 2
 * - 9-11 rounds: best 3
 * - 12-14 rounds: best 4
 * - 15-16 rounds: best 5
 * - 17-18 rounds: best 6
 * - 19 rounds: best 7
 * - 20+ rounds: best 8
 */
export function calculateHandicapIndex(rounds: GolfRound[]): number {
  // Only use official rounds for handicap calculation
  const officialRounds = rounds.filter(r => r.roundType === 'official');

  if (officialRounds.length === 0) return 54.0;

  const roundsWithDifferentials = officialRounds.map(round => ({
    ...round,
    differentialScore: round.differentialScore || calculateDifferential(round)
  }));

  const sortedDifferentials = roundsWithDifferentials
    .map(r => r.differentialScore!)
    .sort((a, b) => a - b);

  let numberOfRoundsToUse = 1;
  if (officialRounds.length >= 6) numberOfRoundsToUse = 2;
  if (officialRounds.length >= 9) numberOfRoundsToUse = 3;
  if (officialRounds.length >= 12) numberOfRoundsToUse = 4;
  if (officialRounds.length >= 15) numberOfRoundsToUse = 5;
  if (officialRounds.length >= 17) numberOfRoundsToUse = 6;
  if (officialRounds.length >= 19) numberOfRoundsToUse = 7;
  if (officialRounds.length >= 20) numberOfRoundsToUse = 8;

  const bestDifferentials = sortedDifferentials.slice(0, numberOfRoundsToUse);
  const average = bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length;

  const handicapIndex = average * 0.96;
  return Math.round(handicapIndex * 10) / 10;
}

/**
 * Generates a handicap history timeline
 * IMPORTANT: Only official rounds are considered!
 */
export function generateHandicapHistory(rounds: GolfRound[]): HandicapHistory[] {
  const history: HandicapHistory[] = [];

  // Only use official rounds for history
  const officialRounds = rounds.filter(r => r.roundType === 'official');
  const sortedRounds = [...officialRounds].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 0; i < sortedRounds.length; i++) {
    const roundsUpToNow = sortedRounds.slice(0, i + 1);
    const handicap = calculateHandicapIndex(roundsUpToNow);

    history.push({
      date: sortedRounds[i].date,
      handicap: handicap,
      roundsPlayed: i + 1
    });
  }

  return history;
}

/**
 * Calculates "what-if" handicap including training rounds
 */
export function calculateWhatIfHandicap(rounds: GolfRound[], includeTraining: boolean = true): number {
  const relevantRounds = includeTraining
    ? rounds
    : rounds.filter(r => r.roundType === 'official');

  return calculateHandicapIndex(relevantRounds.map(r => ({ ...r, roundType: 'official' })));
}
