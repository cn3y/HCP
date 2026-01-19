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
    <div className="relative bg-gradient-to-br from-golf-green-600 via-golf-green-600 to-golf-green-700 rounded-3xl shadow-luxury overflow-hidden animate-fade-in hover:shadow-glow-green transition-all duration-500 group">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full blur-3xl opacity-50 animate-float"></div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-shimmer opacity-20"></div>

      {/* Content */}
      <div className="relative p-6 sm:p-8 lg:p-10 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex-1">
            <p className="text-golf-green-100 text-xs sm:text-sm font-semibold mb-3 uppercase tracking-wider">Current Handicap</p>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black animate-scale-in tracking-tight">{currentHandicap.toFixed(1)}</h1>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-4">
            {trend !== 'neutral' && (
              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl backdrop-blur-sm border-2 ${
                trend === 'down'
                  ? 'bg-emerald-400/20 border-emerald-300/30 text-emerald-50'
                  : 'bg-rose-400/20 border-rose-300/30 text-rose-50'
              } animate-slide-up shadow-lg hover:scale-105 transition-transform`}>
                {trend === 'down' ? <TrendingDown size={24} className="sm:w-9 sm:h-9" /> : <TrendingUp size={24} className="sm:w-9 sm:h-9" />}
                <span className="text-2xl sm:text-3xl font-bold">{change.toFixed(1)}</span>
              </div>
            )}
            {trend === 'neutral' && previousHandicap !== null && (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-golf-green-500/20 border-2 border-golf-green-300/30 text-golf-green-50 backdrop-blur-sm animate-slide-up shadow-lg hover:scale-105 transition-transform">
                <Minus size={24} className="sm:w-9 sm:h-9" />
                <span className="text-2xl sm:text-3xl font-bold">0.0</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/30">
          <p className="text-golf-green-50 text-base sm:text-lg">
            <span className="font-black text-white text-2xl sm:text-3xl tracking-tight">{roundsPlayed}</span>
            <span className="ml-3 font-medium">official rounds played</span>
          </p>
        </div>
      </div>
    </div>
  );
}
