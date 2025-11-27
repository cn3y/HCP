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
      <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
        <p className="text-gray-500">No rounds played yet. Add your first round!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-golf-green-600 to-golf-green-700">
        <h2 className="text-2xl font-bold text-white">Played Rounds</h2>
        <p className="text-golf-green-100 mt-1">All {rounds.length} rounds overview</p>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedRounds.map((round) => {
          const differential = calculateDifferential(round);
          const overPar = round.score - round.par;

          return (
            <div
              key={round.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={18} className="text-golf-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {round.courseName}
                    </h3>
                    {round.roundType === 'training' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Training
                      </span>
                    )}
                    {round.roundType === 'official' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-golf-green-100 text-golf-green-800">
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
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete round"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
