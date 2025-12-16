import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { HandicapHistory } from '../types';

interface HandicapChartProps {
  history: HandicapHistory[];
}

export function HandicapChart({ history }: HandicapChartProps) {
  if (history.length === 0) {
    return null;
  }

  const chartData = history.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short'
    }),
    handicap: entry.handicap,
    roundsPlayed: entry.roundsPlayed
  }));

  return (
    <div className="glass-dark rounded-3xl shadow-soft p-4 sm:p-6 border border-gray-100 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Handicap Development</h2>
        <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
          {history.length} {history.length === 1 ? 'point' : 'points'}
        </span>
      </div>

      <div className="h-56 sm:h-72 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorHandicap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
              tick={{ fill: '#6b7280' }}
              domain={['dataMin - 2', 'dataMax + 2']}
              reversed
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [value.toFixed(1), 'Handicap']}
              labelStyle={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="handicap"
              stroke="#16a34a"
              strokeWidth={3}
              fill="url(#colorHandicap)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
