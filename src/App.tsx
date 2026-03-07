import { useState } from 'react';
import { PlusCircle, Trophy, Target, MapPin, Calendar } from 'lucide-react';
import type { GolfRound, PlayerProfile, RoundFormat } from './types';

export function App() {
  const [rounds, setRounds] = useState<GolfRound[]>([]);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>({
    name: 'Spieler',
    handicapIndex: 28.0,
    startDate: new Date().toISOString().split('T')[0],
    startHandicap: 28.0,
  });
  const [formData, setFormData] = useState({
    date: '',
    courseName: '',
    courseRating: 70.5,
    slopeRating: 120,
    score: 0,
    par: 72,
    holes: '18' as RoundFormat,
    roundType: 'official' as 'official' | 'training',
    notes: '',
  });

  const calculateDifferential = (score: number, courseRating: number, slopeRating: number, holes: RoundFormat, handicapIndex?: number): number => {
    let rawDiff = (113 / slopeRating) * (score - courseRating);
    
    if (holes === '9') {
      // WHS 9-hole to 18-hole conversion
      if (handicapIndex !== undefined && handicapIndex > 0) {
        // Expected 9-hole Differential = (0.52 × Handicap_Index) + 1.2
        const expected9HoleDifferential = (0.52 * handicapIndex) + 1.2;
        rawDiff = rawDiff + expected9HoleDifferential;
      } else {
        // Fallback: double the differential if no handicap index
        rawDiff *= 2;
      }
    }
    
    return Math.round(rawDiff * 10) / 10;
  };

  const calculateHandicapIndex = (differentials: number[]): number => {
    if (differentials.length === 0) return playerProfile.startHandicap;
    
    const sorted = [...differentials].sort((a, b) => a - b);
    const count = Math.min(sorted.length, 8);
    const used = sorted.slice(0, count);
    const sum = used.reduce((acc, diff) => acc + diff, 0);
    
    return Math.round((sum / count) * 0.96 * 10) / 10;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const differential = calculateDifferential(formData.score, formData.courseRating, formData.slopeRating, formData.holes, playerProfile.handicapIndex);
    
    const newRound: GolfRound = {
      id: Date.now().toString(),
      date: formData.date,
      courseName: formData.courseName,
      courseRating: formData.courseRating,
      slopeRating: formData.slopeRating,
      score: formData.score,
      par: formData.par,
      holes: formData.holes,
      roundType: formData.roundType,
      differentialScore: differential,
      notes: formData.notes,
    };
    
    setRounds(prev => [...prev, newRound]);
    
    if (formData.roundType === 'official') {
      const allDifferentials = rounds
        .filter(r => r.roundType === 'official')
        .map(r => r.differentialScore!)
        .concat(differential);
      const newHandicap = calculateHandicapIndex(allDifferentials);
      setPlayerProfile(prev => ({ ...prev, handicapIndex: newHandicap }));
    }
    
    setFormData({
      date: '',
      courseName: '',
      courseRating: 70.5,
      slopeRating: 120,
      score: 0,
      par: 72,
      holes: '18',
      roundType: 'official',
      notes: '',
    });
  };

  const handleDeleteRound = (id: string) => {
    setRounds(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen course-bg-1">
      <div className="fixed inset-0 golf-dimple-pattern pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
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

        <section className="mb-12">
          <div className="glass-dark rounded-3xl shadow-luxury p-8 sm:p-12 border-2 border-golf-green-500/30 course-bg-2 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Target className="text-golf-gold-600 w-8 h-8" />
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800">Current Handicap Index</h2>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 golf-ball opacity-20" style={{ 
                maskImage: 'radial-gradient(circle at 50% 50%, white, transparent)',
                WebkitMaskImage: 'radial-gradient(circle at 50% 50%, white, transparent)'
              }} />
              
              <div className="relative inline-block">
                <div className="text-7xl sm:text-9xl font-black bg-gradient-gold-accent text-transparent bg-clip-text">
                  {playerProfile.handicapIndex.toFixed(1)}
                </div>
                <div className="text-xl sm:text-2xl text-golf-green-700 font-bold mt-2">
                  {playerProfile.handicapIndex < 10 ? 'Scratch Player' : 
                   playerProfile.handicapIndex < 18 ? 'Low Handicap' : 
                   playerProfile.handicapIndex < 25 ? 'Mid Handicap' : 'High Handicap'}
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

        <section className="mb-12">
          <div className="glass-dark rounded-3xl shadow-luxury p-6 sm:p-8 border-2 border-gray-200/60 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle className="text-golf-green-600 w-6 h-6" />
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800">Add Golf Round</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    📅 Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
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
                    placeholder="e.g. Pebble Beach"
                    value={formData.courseName}
                    onChange={e => setFormData({ ...formData, courseName: e.target.value })}
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
                    value={formData.score}
                    onChange={e => setFormData({ ...formData, score: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 bg-white/90"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    🎯 Course Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.courseRating}
                    onChange={e => setFormData({ ...formData, courseRating: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    ⚙️ Slope Rating
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.slopeRating}
                    onChange={e => setFormData({ ...formData, slopeRating: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    🥏 holes
                  </label>
                  <select
                    value={formData.holes}
                    onChange={e => setFormData({ ...formData, holes: e.target.value as RoundFormat })}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 bg-white/90"
                  >
                    <option value="9">9 holes</option>
                    <option value="18">18 holes</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 p-4 bg-golf-green-50 rounded-xl cursor-pointer hover:bg-golf-green-100 transition-colors border-2 border-transparent hover:border-golf-green-300">
                  <input
                    type="radio"
                    name="roundType"
                    value="official"
                    checked={formData.roundType === 'official'}
                    onChange={() => setFormData({ ...formData, roundType: 'official' })}
                    className="w-5 h-5 text-golf-green-600"
                  />
                  <span className="font-semibold text-gray-800">Official Round</span>
                </label>
                <label className="flex items-center space-x-2 p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors border-2 border-transparent hover:border-blue-200">
                  <input
                    type="radio"
                    name="roundType"
                    value="training"
                    checked={formData.roundType === 'training'}
                    onChange={() => setFormData({ ...formData, roundType: 'training' })}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="font-semibold text-gray-800">Training Round</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  📝 Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="Weather, special notes..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 bg-white/90"
                />
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
              {rounds.length > 0 ? (
                rounds.slice(0, 10).map((round) => (
                  <div
                    key={round.id}
                    className="glass-dark rounded-2xl p-5 border-2 border-gray-200 hover:border-golf-green-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-4 mb-3">
                          <MapPin className="text-golf-green-600 w-4 h-4 flex-shrink-0" />
                          <h3 className="text-lg font-bold text-gray-800 truncate">
                            {round.courseName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            round.holes === '9' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {round.holes}-Hole
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            round.roundType === 'official' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-500'
                          }`}>
                            {round.roundType === 'official' ? 'Official' : 'Training'}
                          </span>
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
                        onClick={() => handleDeleteRound(round.id)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
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
