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

  // Calculate what-if handicap (with training rounds)
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
    <div className="relative bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600 rounded-3xl shadow-soft overflow-hidden animate-fade-in">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Content */}
      <div className="relative p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Calculator size={28} className="text-blue-50" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">What-If Scenario</h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                {trainingRounds.length} training {trainingRounds.length === 1 ? 'round' : 'rounds'} counted as official
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mt-6">
          <div className="flex-1">
            <p className="text-blue-100 text-xs sm:text-sm font-medium mb-2 uppercase tracking-wide">Hypothetical Handicap</p>
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-bold animate-scale-in">{whatIfHandicap.toFixed(1)}</h3>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-4">
            <p className="text-blue-100 text-xs sm:text-sm whitespace-nowrap">Difference</p>
            {trend === 'down' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-100 backdrop-blur-sm animate-slide-up">
                <TrendingDown size={24} className="sm:w-7 sm:h-7" />
                <span className="text-xl sm:text-2xl font-semibold">-{absoluteDifference.toFixed(1)}</span>
              </div>
            )}
            {trend === 'up' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-100 backdrop-blur-sm animate-slide-up">
                <TrendingUp size={24} className="sm:w-7 sm:h-7" />
                <span className="text-xl sm:text-2xl font-semibold">+{absoluteDifference.toFixed(1)}</span>
              </div>
            )}
            {trend === 'neutral' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-400/20 text-blue-100 backdrop-blur-sm animate-slide-up">
                <Minus size={24} className="sm:w-7 sm:h-7" />
                <span className="text-xl sm:text-2xl font-semibold">±{absoluteDifference.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-blue-50 text-sm sm:text-base">
            {trend === 'down' && 'Your training rounds would improve your handicap!'}
            {trend === 'up' && 'Your training rounds would worsen your handicap'}
            {trend === 'neutral' && 'Your training rounds would barely change your handicap'}
          </p>
        </div>
      </div>
    </div>
  );
}
