import { Trash2, Calendar, MapPin, Trophy, Target } from 'lucide-react';
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
        <div className="inline-block p-6 bg-gradient-to-br from-golf-green-100 to-golf-gold-200 rounded-full mb-6">
          <Trophy className="w-16 h-16 text-golf-green-600" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2">Ready to Start?</h3>
        <p className="text-gray-600 text-lg font-semibold">Record your first round and track your handicap!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="glass-dark rounded-3xl shadow-luxury p-5 sm:p-7 border-2 border-golf-green-300/50 bg-gradient-to-br from-golf-green-50/30 via-white to-golf-gold-50/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Your Scorecard</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2 font-medium">Your last {Math.min(rounds.length, 20)} rounds</p>
          </div>
          <div className="px-5 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-golf-green-600 via-golf-gold-500 to-golf-green-600 text-white rounded-full font-black text-lg sm:text-xl shadow-glow-green">
            {rounds.length}
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {sortedRounds.map((round, index) => {
          const differential = calculateDifferential(round);
          const overPar = round.score - round.par;
          const isBestShot = index === 0 && differential < 5;

          return (
            <div
              key={round.id}
              className={`glass-dark rounded-2xl shadow-soft hover:shadow-luxury p-5 sm:p-7 border-2 border-gray-200/60 hover:border-golf-green-300 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden ${isBestShot ? 'ring-2 ring-golf-gold-400' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Golf-themed background effect */}
              {isBestShot && (
                <div className="absolute inset-0 bg-gradient-to-r from-golf-gold-50 to-transparent opacity-50" />
              )}
              
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Header with course name and type */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg ${isBestShot ? 'bg-gradient-to-br from-golf-gold-200 to-golf-gold-300' : 'bg-golf-green-100'}`}>
                        <MapPin size={18} className={isBestShot ? 'text-golf-gold-700' : 'text-golf-green-700'} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                        {round.courseName}
                      </h3>
                    </div>
                    
                    {round.roundType === 'training' ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border-2 border-blue-200 whitespace-nowrap">
                        Practice
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-golf-green-100 text-golf-green-800 border-2 border-golf-green-200 whitespace-nowrap">
                        {isBestShot && <Target className="w-3 h-3 mr-1 animate-pulse" />}
                        Official
                      </span>
                    )}
                  </div>

                  {/* Score details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-white/90 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Score</div>
                      <div className="text-2xl sm:text-3xl font-black text-gray-800">{round.score}</div>
                    </div>
                    
                    <div className="bg-white/90 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Par</div>
                      <div className="text-2xl sm:text-3xl font-black text-gray-800">{round.par}</div>
                    </div>
                    
                    <div className="bg-white/90 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Over Par</div>
                      <div className={`text-2xl sm:text-3xl font-black ${
                        overPar > 0 ? 'text-red-600' : 
                        overPar < 0 ? 'text-emerald-600' : 
                        'text-gray-800'
                      }`}>
                        {overPar > 0 ? '+' : ''}{overPar}
                      </div>
                    </div>
                    
                    <div className="bg-white/90 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Course Rating</div>
                      <div className="text-lg sm:text-xl font-black text-gray-800">{round.courseRating.toFixed(1)}</div>
                    </div>
                    
                    <div className={`col-span-2 sm:col-span-1 bg-gradient-to-br ${
                      isBestShot 
                        ? 'from-golf-gold-100 via-golf-gold-200 to-golf-gold-100' 
                        : 'from-golf-green-50 via-golf-green-100 to-golf-green-50'
                    } p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 ${
                      isBestShot ? 'border-golf-gold-400' : 'border-golf-green-200'
                    }`}>
                      <div className="flex items-center gap-1 mb-1">
                        <Trophy className={`w-3 h-3 ${isBestShot ? 'text-golf-gold-600' : 'text-golf-green-700'}`} />
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-700">Differential</span>
                      </div>
                      <div className={`text-2xl sm:text-3xl font-black ${
                        isBestShot ? 'text-golf-gold-700' : 'text-golf-green-800'
                      }`}>
                        {differential.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  {round.date && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(round.date).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDeleteRound(round.id)}
                  className="flex-shrink-0 p-3 sm:p-3.5 text-red-600 hover:bg-red-50 group-hover/text-red-700 hover:scale-110 hover:rotate-12 rounded-xl transition-all active:scale-90 hover:shadow-md border-2 border-transparent hover:border-red-200"
                  aria-label="Delete round"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
