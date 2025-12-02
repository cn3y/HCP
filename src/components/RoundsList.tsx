import { Trash2, Calendar, MapPin } from 'lucide-react';
import type { GolfRound } from '../types';
import { calculateDifferential } from '../utils/handicapCalculator';

interface RoundsListProps {
  rounds: GolfRound[];
  onDeleteRound: (id: string) => void;
}

export function RoundsList({ rounds, onDeleteRound }: RoundsListProps) {
  const sortedRounds = [...rounds].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (rounds.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-12 text-center border border-white/50">
        <p className="text-gray-500 text-lg">No rounds played yet. Add your first round!</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
      <div className="p-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white drop-shadow">Played Rounds</h2>
          <p className="text-white/90 mt-2 font-medium">All {rounds.length} rounds overview</p>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedRounds.map((round) => {
          const differential = calculateDifferential(round);
          const overPar = round.score - round.par;

          return (
            <div
              key={round.id}
              className="p-6 hover:bg-emerald-50/50 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={18} className="text-golf-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {round.courseName}
                    </h3>
                    {round.roundType === 'training' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                        Training
                      </span>
                    )}
                    {round.roundType === 'official' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                        Official
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Calendar size={16} />
                    <span>
                      {new Date(round.date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Score:</span>
                      <span className="ml-2 font-semibold text-gray-800">{round.score}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Par:</span>
                      <span className="ml-2 font-semibold text-gray-800">{round.par}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Over Par:</span>
                      <span className={`ml-2 font-semibold ${overPar > 0 ? 'text-red-600' : overPar < 0 ? 'text-green-600' : 'text-gray-800'}`}>
                        {overPar > 0 ? '+' : ''}{overPar}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">CR:</span>
                      <span className="ml-2 font-semibold text-gray-800">{round.courseRating.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Differential:</span>
                      <span className="ml-2 font-semibold text-golf-green-700">{differential.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteRound(round.id)}
                  className="ml-4 p-3 text-red-600 hover:bg-red-100 rounded-2xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                  aria-label="Delete round"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
