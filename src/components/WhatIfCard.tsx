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
    <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl shadow-2xl p-8 text-white border border-white/20 transform hover:scale-[1.02] transition-all duration-300">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
            <Calculator size={32} className="text-white drop-shadow" />
          </div>
          <div>
            <h2 className="text-2xl font-bold drop-shadow">What-If Scenario</h2>
            <p className="text-white/90 text-sm mt-1">
              {trainingRounds.length} training {trainingRounds.length === 1 ? 'round' : 'rounds'} counted as official
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div>
            <p className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wide">Hypothetical Handicap</p>
            <h3 className="text-6xl font-black drop-shadow-lg">{whatIfHandicap.toFixed(1)}</h3>
          </div>

          <div className="text-right">
            <p className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wide">Difference</p>
            {trend === 'down' && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-sm bg-green-400/30">
                <TrendingDown size={32} className="drop-shadow" />
                <span className="text-3xl font-bold drop-shadow">-{absoluteDifference.toFixed(1)}</span>
              </div>
            )}
            {trend === 'up' && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-sm bg-red-400/30">
                <TrendingUp size={32} className="drop-shadow" />
                <span className="text-3xl font-bold drop-shadow">+{absoluteDifference.toFixed(1)}</span>
              </div>
            )}
            {trend === 'neutral' && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-sm bg-white/20">
                <Minus size={32} className="drop-shadow" />
                <span className="text-3xl font-bold drop-shadow">±{absoluteDifference.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/30">
          <p className="text-white/95 text-base font-medium">
            {trend === 'down' && '💪 Your training rounds would improve your handicap!'}
            {trend === 'up' && '📈 Your training rounds would worsen your handicap'}
            {trend === 'neutral' && '➡️ Your training rounds would barely change your handicap'}
          </p>
        </div>
      </div>
    </div>
  );
}
