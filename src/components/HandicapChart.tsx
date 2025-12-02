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
    <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/50 transform hover:shadow-3xl transition-all duration-300">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-8">Handicap Development</h2>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorHandicap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 2', 'dataMax + 2']}
            reversed
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            formatter={(value: number) => [value.toFixed(1), 'Handicap']}
          />
          <Area
            type="monotone"
            dataKey="handicap"
            stroke="#16a34a"
            strokeWidth={3}
            fill="url(#colorHandicap)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-6 border-t border-gray-200/50 text-sm text-gray-600 text-center font-medium">
        {history.length} data {history.length === 1 ? 'point' : 'points'} in history
      </div>
    </div>
  );
}
