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
    <div className="glass-dark rounded-3xl shadow-luxury p-6 sm:p-8 border-2 border-gray-200/60 animate-fade-in hover:border-golf-green-200 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Handicap Development</h2>
        <span className="text-sm sm:text-base text-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-full font-bold border-2 border-gray-200 shadow-sm">
          {history.length} {history.length === 1 ? 'point' : 'points'}
        </span>
      </div>

      <div className="h-64 sm:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorHandicap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.5}/>
                <stop offset="50%" stopColor="#16a34a" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" opacity={0.6} />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontWeight: 600 }}
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontWeight: 600 }}
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#9ca3af' }}
              domain={['dataMin - 2', 'dataMax + 2']}
              reversed
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '2px solid #16a34a',
                borderRadius: '16px',
                padding: '14px 18px',
                boxShadow: '0 10px 40px rgba(22, 163, 74, 0.15)'
              }}
              formatter={(value: number | undefined) => value !== undefined ? [value.toFixed(1), 'Handicap'] : ['', 'Handicap']}
              labelStyle={{ fontWeight: 700, color: '#1f2937', marginBottom: '6px', fontSize: '14px' }}
            />
            <Area
              type="monotone"
              dataKey="handicap"
              stroke="#16a34a"
              strokeWidth={4}
              fill="url(#colorHandicap)"
              animationDuration={1200}
              dot={{ fill: '#16a34a', strokeWidth: 2, r: 5, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
