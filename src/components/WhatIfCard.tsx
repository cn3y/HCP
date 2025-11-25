import { Calculator, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { GolfRound } from '../types';
import { calculateWhatIfHandicap } from '../utils/handicapCalculator';

interface WhatIfCardProps {
  allRounds: GolfRound[];
  currentHandicap: number;
}

export function WhatIfCard({ allRounds, currentHandicap }: WhatIfCardProps) {
  const trainingRounds = allRounds.filter(r => r.roundType === 'training');

  if (trainingRounds.length === 0) {
    return null;
  }

  // Berechne Was-wäre-wenn Handicap (mit Trainingsrunden)
  const whatIfHandicap = calculateWhatIfHandicap(allRounds, true);
  const difference = whatIfHandicap - currentHandicap;
  const absoluteDifference = Math.abs(difference);

  const getTrend = () => {
    if (difference < -0.1) return 'down';
    if (difference > 0.1) return 'up';
    return 'neutral';
  };

  const trend = getTrend();

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Calculator size={32} className="text-blue-100" />
        <div>
          <h2 className="text-2xl font-bold">Was-wäre-wenn Szenario</h2>
          <p className="text-blue-100 text-sm">
            {trainingRounds.length} {trainingRounds.length === 1 ? 'Trainingsrunde' : 'Trainingsrunden'} als offizielle Runden gerechnet
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <p className="text-blue-100 text-sm mb-2">Hypothetisches Handicap</p>
          <h3 className="text-5xl font-bold">{whatIfHandicap.toFixed(1)}</h3>
        </div>

        <div className="text-right">
          <p className="text-blue-100 text-sm mb-2">Differenz zum aktuellen</p>
          {trend === 'down' && (
            <div className="flex items-center gap-2 text-green-200">
              <TrendingDown size={28} />
              <span className="text-2xl font-semibold">-{absoluteDifference.toFixed(1)}</span>
            </div>
          )}
          {trend === 'up' && (
            <div className="flex items-center gap-2 text-red-200">
              <TrendingUp size={28} />
              <span className="text-2xl font-semibold">+{absoluteDifference.toFixed(1)}</span>
            </div>
          )}
          {trend === 'neutral' && (
            <div className="flex items-center gap-2 text-blue-200">
              <Minus size={28} />
              <span className="text-2xl font-semibold">±{absoluteDifference.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-blue-400">
        <p className="text-blue-100 text-sm">
          {trend === 'down' && '💪 Ihre Trainingsrunden würden Ihr Handicap verbessern!'}
          {trend === 'up' && '📈 Ihre Trainingsrunden würden Ihr Handicap verschlechtern'}
          {trend === 'neutral' && '➡️ Ihre Trainingsrunden würden Ihr Handicap kaum verändern'}
        </p>
      </div>
    </div>
  );
}
