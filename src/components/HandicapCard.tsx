import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface HandicapCardProps {
  currentHandicap: number;
  previousHandicap: number | null;
  roundsPlayed: number;
}

export function HandicapCard({ currentHandicap, previousHandicap, roundsPlayed }: HandicapCardProps) {
  const getTrend = () => {
    if (previousHandicap === null) return 'neutral';
    if (currentHandicap < previousHandicap) return 'down';
    if (currentHandicap > previousHandicap) return 'up';
    return 'neutral';
  };

  const trend = getTrend();
  const change = previousHandicap !== null ? Math.abs(currentHandicap - previousHandicap) : 0;

  return (
    <div className="relative bg-gradient-to-br from-golf-green-600 via-golf-green-600 to-golf-green-700 rounded-3xl shadow-soft overflow-hidden animate-fade-in">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Content */}
      <div className="relative p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex-1">
            <p className="text-golf-green-100 text-xs sm:text-sm font-medium mb-2 uppercase tracking-wide">Current Handicap</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold animate-scale-in">{currentHandicap.toFixed(1)}</h1>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-4">
            {trend !== 'neutral' && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                trend === 'down'
                  ? 'bg-green-500/20 text-green-100'
                  : 'bg-red-500/20 text-red-100'
              } animate-slide-up`}>
                {trend === 'down' ? <TrendingDown size={24} className="sm:w-8 sm:h-8" /> : <TrendingUp size={24} className="sm:w-8 sm:h-8" />}
                <span className="text-xl sm:text-2xl font-semibold">{change.toFixed(1)}</span>
              </div>
            )}
            {trend === 'neutral' && previousHandicap !== null && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-golf-green-500/20 text-golf-green-100 backdrop-blur-sm animate-slide-up">
                <Minus size={24} className="sm:w-8 sm:h-8" />
                <span className="text-xl sm:text-2xl font-semibold">0.0</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-golf-green-50 text-sm sm:text-base">
            <span className="font-bold text-white text-xl sm:text-2xl">{roundsPlayed}</span>
            <span className="ml-2">rounds played</span>
          </p>
        </div>
      </div>
    </div>
  );
}
