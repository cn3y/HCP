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
    <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl p-8 text-white border border-white/20 transform hover:scale-[1.02] transition-all duration-300">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wide">Current Handicap</p>
            <h1 className="text-7xl font-black tracking-tight drop-shadow-lg">{currentHandicap.toFixed(1)}</h1>
          </div>
          <div className="text-right">
            {trend !== 'neutral' && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-sm ${trend === 'down' ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
                {trend === 'down' ? <TrendingDown size={36} className="drop-shadow" /> : <TrendingUp size={36} className="drop-shadow" />}
                <span className="text-3xl font-bold drop-shadow">{change.toFixed(1)}</span>
              </div>
            )}
            {trend === 'neutral' && previousHandicap !== null && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-sm bg-white/20">
                <Minus size={36} className="drop-shadow" />
                <span className="text-3xl font-bold drop-shadow">0.0</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/30">
          <p className="text-white/90 text-base">
            <span className="font-bold text-white text-2xl drop-shadow">{roundsPlayed}</span> rounds played
          </p>
        </div>
      </div>
    </div>
  );
}
