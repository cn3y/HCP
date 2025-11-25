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
  if (rounds.length === 0) return 54.0;

  const roundsWithDifferentials = rounds.map(round => ({
    ...round,
    differentialScore: calculateDifferential(round)
  }));

  const sortedDifferentials = roundsWithDifferentials
    .map(r => r.differentialScore!)
    .sort((a, b) => a - b);

  let numberOfRoundsToUse = 1;
  if (rounds.length >= 6) numberOfRoundsToUse = 2;
  if (rounds.length >= 9) numberOfRoundsToUse = 3;
  if (rounds.length >= 12) numberOfRoundsToUse = 4;
  if (rounds.length >= 15) numberOfRoundsToUse = 5;
  if (rounds.length >= 17) numberOfRoundsToUse = 6;
  if (rounds.length >= 19) numberOfRoundsToUse = 7;
  if (rounds.length >= 20) numberOfRoundsToUse = 8;

  const bestDifferentials = sortedDifferentials.slice(0, numberOfRoundsToUse);
  const average = bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length;

  const handicapIndex = average * 0.96;
  return Math.round(handicapIndex * 10) / 10;
}

/**
 * Erstellt eine Handicap-Verlaufshistorie
 */
export function generateHandicapHistory(rounds: GolfRound[]): HandicapHistory[] {
  const history: HandicapHistory[] = [];
  const sortedRounds = [...rounds].sort((a, b) =>
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
 * Speichert Runden im LocalStorage
 */
export function saveRounds(rounds: GolfRound[]): void {
  localStorage.setItem('golf-rounds', JSON.stringify(rounds));
}

/**
 * Lädt Runden aus dem LocalStorage
 */
export function loadRounds(): GolfRound[] {
  const data = localStorage.getItem('golf-rounds');
  return data ? JSON.parse(data) : [];
}
