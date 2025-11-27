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
    <div className="bg-gradient-to-br from-golf-green-600 to-golf-green-700 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-golf-green-100 text-sm font-medium mb-2">Current Handicap</p>
          <h1 className="text-6xl font-bold">{currentHandicap.toFixed(1)}</h1>
        </div>
        <div className="text-right">
          {trend !== 'neutral' && (
            <div className={`flex items-center gap-2 ${trend === 'down' ? 'text-green-200' : 'text-red-200'}`}>
              {trend === 'down' ? <TrendingDown size={32} /> : <TrendingUp size={32} />}
              <span className="text-2xl font-semibold">{change.toFixed(1)}</span>
            </div>
          )}
          {trend === 'neutral' && previousHandicap !== null && (
            <div className="flex items-center gap-2 text-golf-green-200">
              <Minus size={32} />
              <span className="text-2xl font-semibold">0.0</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-golf-green-500">
        <p className="text-golf-green-100 text-sm">
          <span className="font-semibold text-white text-lg">{roundsPlayed}</span> rounds played
        </p>
      </div>
    </div>
  );
}
