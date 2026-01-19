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
      <div className="glass-dark rounded-3xl shadow-luxury p-12 sm:p-16 text-center border-2 border-gray-200/60 animate-fade-in">
        <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
          <Calendar size={32} className="text-gray-400" />
        </div>
        <p className="text-gray-600 text-lg sm:text-xl font-semibold">No rounds played yet. Add your first round!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="glass-dark rounded-3xl shadow-luxury p-5 sm:p-7 border-2 border-gray-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Played Rounds</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2 font-medium">All {rounds.length} rounds overview</p>
          </div>
          <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-golf-green-600 via-golf-green-600 to-golf-green-700 text-white rounded-full font-black text-base sm:text-lg shadow-glow-green border-2 border-golf-green-500">
            {rounds.length}
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {sortedRounds.map((round, index) => {
          const differential = calculateDifferential(round);
          const overPar = round.score - round.par;

          return (
            <div
              key={round.id}
              className="glass-dark rounded-2xl shadow-soft hover:shadow-luxury p-5 sm:p-7 border-2 border-gray-200/60 hover:border-golf-green-300 transition-all duration-300 hover:scale-[1.02] group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-golf-green-100 rounded-lg group-hover:bg-golf-green-200 transition-colors">
                        <MapPin size={18} className="text-golf-green-700 flex-shrink-0" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                        {round.courseName}
                      </h3>
                    </div>
                    {round.roundType === 'training' ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border-2 border-blue-200 whitespace-nowrap">
                        Training
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-golf-green-100 text-golf-green-800 border-2 border-golf-green-200 whitespace-nowrap">
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
                    <div className="bg-white/80 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Score</div>
                      <div className="text-xl sm:text-2xl font-black text-gray-800">{round.score}</div>
                    </div>
                    <div className="bg-white/80 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Par</div>
                      <div className="text-xl sm:text-2xl font-black text-gray-800">{round.par}</div>
                    </div>
                    <div className="bg-white/80 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Over Par</div>
                      <div className={`text-xl sm:text-2xl font-black ${overPar > 0 ? 'text-red-600' : overPar < 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                        {overPar > 0 ? '+' : ''}{overPar}
                      </div>
                    </div>
                    <div className="bg-white/80 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Course</div>
                      <div className="text-xl sm:text-2xl font-black text-gray-800">{round.courseRating.toFixed(1)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-golf-green-50 to-golf-green-100 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-golf-green-200 col-span-2 sm:col-span-1">
                      <div className="text-xs text-golf-green-700 mb-1 font-bold uppercase tracking-wide">Differential</div>
                      <div className="text-xl sm:text-2xl font-black text-golf-green-800">{differential.toFixed(1)}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteRound(round.id)}
                  className="flex-shrink-0 p-3 sm:p-3.5 text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90 hover:shadow-md border-2 border-transparent hover:border-red-200 group/delete"
                  aria-label="Delete round"
                >
                  <Trash2 size={20} className="sm:w-6 sm:h-6 group-hover/delete:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
