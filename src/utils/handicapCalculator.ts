import type { GolfRound, HandicapHistory } from '../types';

/**
 * Berechnet den Score Differential für eine Runde
 * Formel: (113 / Slope Rating) × (Adjusted Gross Score - Course Rating)
 */
export function calculateDifferential(round: GolfRound): number {
  const differential = (113 / round.slopeRating) * (round.score - round.courseRating);
  return Math.round(differential * 10) / 10;
}

/**
 * Berechnet das Handicap Index basierend auf den besten Runden
 * WICHTIG: Nur offizielle Runden werden berücksichtigt!
 * Vereinfachte WHS-Methode:
 * - 1-5 Runden: beste 1
 * - 6-8 Runden: beste 2
 * - 9-11 Runden: beste 3
 * - 12-14 Runden: beste 4
 * - 15-16 Runden: beste 5
 * - 17-18 Runden: beste 6
 * - 19 Runden: beste 7
 * - 20+ Runden: beste 8
 */
export function calculateHandicapIndex(rounds: GolfRound[]): number {
  // Nur offizielle Runden für Handicap-Berechnung verwenden
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
 * Erstellt eine Handicap-Verlaufshistorie
 * WICHTIG: Nur offizielle Runden werden berücksichtigt!
 */
export function generateHandicapHistory(rounds: GolfRound[]): HandicapHistory[] {
  const history: HandicapHistory[] = [];

  // Nur offizielle Runden für Historie verwenden
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
 * Berechnet "Was-wäre-wenn" Handicap mit Trainingsrunden
 */
export function calculateWhatIfHandicap(rounds: GolfRound[], includeTraining: boolean = true): number {
  const relevantRounds = includeTraining
    ? rounds
    : rounds.filter(r => r.roundType === 'official');

  return calculateHandicapIndex(relevantRounds.map(r => ({ ...r, roundType: 'official' })));
}
