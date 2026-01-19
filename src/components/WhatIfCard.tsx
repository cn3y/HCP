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
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl shadow-luxury overflow-hidden animate-fade-in hover:shadow-glow-blue transition-all duration-500 group">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-white rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-purple-300 rounded-full blur-3xl opacity-30 animate-float"></div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-shimmer opacity-20"></div>

      {/* Content */}
      <div className="relative p-6 sm:p-8 lg:p-10 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/25 rounded-2xl backdrop-blur-sm shadow-lg border border-white/20 hover:scale-110 transition-transform">
              <Calculator size={32} className="text-blue-50" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">What-If Scenario</h2>
              <p className="text-blue-100 text-sm sm:text-base mt-1.5 font-medium">
                {trainingRounds.length} training {trainingRounds.length === 1 ? 'round' : 'rounds'} counted as official
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mt-8">
          <div className="flex-1">
            <p className="text-blue-100 text-xs sm:text-sm font-semibold mb-3 uppercase tracking-wider">Hypothetical Handicap</p>
            <h3 className="text-5xl sm:text-6xl lg:text-7xl font-black animate-scale-in tracking-tight">{whatIfHandicap.toFixed(1)}</h3>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-4">
            <p className="text-blue-100 text-sm sm:text-base font-semibold whitespace-nowrap uppercase tracking-wide">Impact</p>
            {trend === 'down' && (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-400/20 border-2 border-emerald-300/30 text-emerald-50 backdrop-blur-sm animate-slide-up shadow-lg hover:scale-105 transition-transform">
                <TrendingDown size={24} className="sm:w-8 sm:h-8" />
                <span className="text-2xl sm:text-3xl font-bold">-{absoluteDifference.toFixed(1)}</span>
              </div>
            )}
            {trend === 'up' && (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-400/20 border-2 border-rose-300/30 text-rose-50 backdrop-blur-sm animate-slide-up shadow-lg hover:scale-105 transition-transform">
                <TrendingUp size={24} className="sm:w-8 sm:h-8" />
                <span className="text-2xl sm:text-3xl font-bold">+{absoluteDifference.toFixed(1)}</span>
              </div>
            )}
            {trend === 'neutral' && (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-400/20 border-2 border-blue-300/30 text-blue-50 backdrop-blur-sm animate-slide-up shadow-lg hover:scale-105 transition-transform">
                <Minus size={24} className="sm:w-8 sm:h-8" />
                <span className="text-2xl sm:text-3xl font-bold">±{absoluteDifference.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/30">
          <p className="text-blue-50 text-base sm:text-lg font-medium">
            {trend === 'down' && '✨ Your training rounds would improve your handicap!'}
            {trend === 'up' && '⚠️ Your training rounds would worsen your handicap'}
            {trend === 'neutral' && '➖ Your training rounds would barely change your handicap'}
          </p>
        </div>
      </div>
    </div>
  );
}
