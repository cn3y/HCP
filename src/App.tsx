import { useState } from 'react';
import { PlusCircle, Trophy, Target, MapPin, Calendar } from 'lucide-react';
import type { GolfRound } from './types';

export function App() {
  const [rounds, setRounds] = useState<GolfRound[]>([]);
  const [handicap] = useState<number>(28.0);

  const handleDeleteRound = (id: string | number) => {
    setRounds(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen course-bg-1">
      {/* Subtle golf ball dimple pattern overlay */}
      <div className="fixed inset-0 golf-dimple-pattern pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with golf theme */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="text-golf-green-700 w-10 h-10 animate-float" />
            <h1 className="text-5xl sm:text-6xl font-black bg-gradient-text tracking-tight">
              Golf Handicap Tracker
            </h1>
            <Trophy className="text-golf-green-700 w-10 h-10 animate-float" style={{ animationDelay: '0.2s' }} />
          </div>
          <p className="text-xl text-gray-700 font-semibold">Master Your Game, Track Your Progress</p>
        </header>

        {/* Current Handicap Display */}
        <section className="mb-12">
          <div className="glass-dark rounded-3xl shadow-luxury p-8 sm:p-12 border-2 border-golf-green-500/30 course-bg-2 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Target className="text-golf-gold-600 w-8 h-8" />
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800">Current Handicap Index</h2>
            </div>
            
            <div className="relative">
              {/* Golf ball background effect */}
              <div className="absolute inset-0 golf-ball opacity-20" style={{ 
                maskImage: 'radial-gradient(circle at 50% 50%, white, transparent)',
                WebkitMaskImage: 'radial-gradient(circle at 50% 50%, white, transparent)'
              }} />
              
              <div className="relative inline-block">
                <div className="text-7xl sm:text-9xl font-black bg-gradient-gold-accent text-transparent bg-clip-text">
                  {handicap.toFixed(1)}
                </div>
                <div className="text-xl sm:text-2xl text-golf-green-700 font-bold mt-2">
                  {handicap < 10 ? 'Scratch Player' : 
                   handicap < 18 ? 'Low Handicap' : 
                   handicap < 25 ? 'Mid Handicap' : 'High Handicap'}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-golf-green-700">
                    {rounds.filter(r => r.roundType === 'official').length}
                  </div>
                  <div className="text-sm text-gray-600 font-semibold">Official Rounds</div>
                </div>
                <div className="w-px h-12 bg-gray-300" />
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-golf-blue-600">
                    {rounds.filter(r => r.roundType === 'training').length}
                  </div>
                  <div className="text-sm text-gray-600 font-semibold">Training Rounds</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add New Round */}
        <section className="mb-12">
          <div className="glass-dark rounded-3xl shadow-luxury p-6 sm:p-8 border-2 border-gray-200/60 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle className="text-golf-green-600 w-6 h-6" />
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800">Add Golf Round</h2>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    📅 Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    🏌️ Course Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pebble Beach Golf Links"
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    🎯 Score
                  </label>
                  <input
                    type="number"
                    required
                    min="27"
                    max="130"
                    placeholder="e.g. 85"
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 bg-white/90"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 p-4 bg-golf-green-50 rounded-xl cursor-pointer hover:bg-golf-green-100 transition-colors border-2 border-transparent hover:border-golf-green-300">
                  <input
                    type="radio"
                    name="roundType"
                    value="official"
                    defaultChecked
                    className="w-5 h-5 text-golf-green-600"
                  />
                  <span className="font-semibold text-gray-800">Official Round</span>
                </label>
                <label className="flex items-center space-x-2 p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors border-2 border-transparent hover:border-blue-200">
                  <input
                    type="radio"
                    name="roundType"
                    value="training"
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="font-semibold text-gray-800">Training Round</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-golf-green-600 to-golf-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-golf-green-700 hover:to-golf-green-800 transition-all shadow-glow-green"
              >
                Add Round
              </button>
            </form>
          </div>
        </section>

        {/* Rounds List */}
        <section>
          <div className="glass-dark rounded-3xl shadow-luxury p-6 sm:p-8 border-2 border-gray-200/60">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="text-golf-green-600 w-6 h-6" />
                <h2 className="text-2xl sm:text-3xl font-black text-gray-800">Recent Rounds</h2>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-golf-green-600 to-golf-green-700 text-white rounded-full font-black">
                {rounds.length} Rounds
              </div>
            </div>

            <div className="space-y-4">
              {rounds.slice(0, 10).map((round, index) => (
                <div
                  key={round.id || index}
                  className="glass-dark rounded-2xl p-5 border-2 border-gray-200 hover:border-golf-green-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-4 mb-3">
                        <MapPin className="text-golf-green-600 w-4 h-4 flex-shrink-0" />
                        <h3 className="text-lg font-bold text-gray-800 truncate">
                          {round.courseName}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{round.date}</span>
                        </div>
                        <div className="font-bold text-golf-green-700 text-lg">
                          Score: {round.score}
                        </div>
                        <div className="font-bold text-golf-gold-600 text-lg">
                          Diff: {round.differentialScore?.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRound(round.id || index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {rounds.length === 0 && (
                <div className="text-center py-12 text-gray-600">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">No rounds yet. Start tracking your game!</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;