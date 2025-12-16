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
      <div className="glass-dark rounded-3xl shadow-soft p-8 sm:p-12 text-center border border-gray-100 animate-fade-in">
        <p className="text-gray-600 text-base sm:text-lg">No rounds played yet. Add your first round!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-dark rounded-3xl shadow-soft p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Played Rounds</h2>
            <p className="text-gray-500 text-sm sm:text-base mt-1">All {rounds.length} rounds overview</p>
          </div>
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-golf-green-600 to-golf-green-700 text-white rounded-full font-bold text-sm sm:text-base">
            {rounds.length}
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {sortedRounds.map((round, index) => {
          const differential = calculateDifferential(round);
          const overPar = round.score - round.par;

          return (
            <div
              key={round.id}
              className="glass-dark rounded-2xl shadow-sm hover:shadow-soft p-4 sm:p-6 border border-gray-100 transition-all duration-200 hover:scale-[1.01]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={16} className="text-golf-green-600 flex-shrink-0" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                        {round.courseName}
                      </h3>
                    </div>
                    {round.roundType === 'training' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 whitespace-nowrap">
                        Training
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-golf-green-100 text-golf-green-800 whitespace-nowrap">
                        Official
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span>
                      {new Date(round.date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-white/60 p-2 sm:p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-0.5">Score</div>
                      <div className="text-lg sm:text-xl font-bold text-gray-800">{round.score}</div>
                    </div>
                    <div className="bg-white/60 p-2 sm:p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-0.5">Par</div>
                      <div className="text-lg sm:text-xl font-bold text-gray-800">{round.par}</div>
                    </div>
                    <div className="bg-white/60 p-2 sm:p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-0.5">Over Par</div>
                      <div className={`text-lg sm:text-xl font-bold ${overPar > 0 ? 'text-red-600' : overPar < 0 ? 'text-green-600' : 'text-gray-800'}`}>
                        {overPar > 0 ? '+' : ''}{overPar}
                      </div>
                    </div>
                    <div className="bg-white/60 p-2 sm:p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-0.5">Course Rating</div>
                      <div className="text-lg sm:text-xl font-bold text-gray-800">{round.courseRating.toFixed(1)}</div>
                    </div>
                    <div className="bg-white/60 p-2 sm:p-3 rounded-xl col-span-2 sm:col-span-1">
                      <div className="text-xs text-gray-500 mb-0.5">Differential</div>
                      <div className="text-lg sm:text-xl font-bold text-golf-green-700">{differential.toFixed(1)}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteRound(round.id)}
                  className="flex-shrink-0 p-2.5 sm:p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95 hover:shadow-sm"
                  aria-label="Delete round"
                >
                  <Trash2 size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
