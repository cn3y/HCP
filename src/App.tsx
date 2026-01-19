import { useState, useEffect } from 'react';
import type { GolfRound } from './types';
import { HandicapCard } from './components/HandicapCard';
import { RoundForm } from './components/RoundForm';
import { RoundsList } from './components/RoundsList';
import { HandicapChart } from './components/HandicapChart';
import { WhatIfCard } from './components/WhatIfCard';
import {
  calculateHandicapIndex,
  generateHandicapHistory,
} from './utils/handicapCalculator';
import { apiService } from './services/api';
import { Trophy, AlertCircle } from 'lucide-react';

function App() {
  const [rounds, setRounds] = useState<GolfRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load rounds on startup
  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRounds();
      setRounds(data);
    } catch (err) {
      console.error('Failed to load rounds:', err);
      setError('Failed to load rounds. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRound = async (round: GolfRound) => {
    try {
      setError(null);
      const newRound = await apiService.createRound(round);
      setRounds([...rounds, newRound]);
    } catch (err) {
      console.error('Failed to add round:', err);
      setError('Failed to add round');
    }
  };

  const handleDeleteRound = async (id: string) => {
    try {
      setError(null);
      await apiService.deleteRound(id);
      setRounds(rounds.filter(round => round.id !== id));
    } catch (err) {
      console.error('Failed to delete round:', err);
      setError('Failed to delete round');
    }
  };

  const currentHandicap = calculateHandicapIndex(rounds);
  const history = generateHandicapHistory(rounds);
  const previousHandicap = history.length > 1 ? history[history.length - 2].handicap : null;
  const officialRounds = rounds.filter(r => r.roundType === 'official');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-dark shadow-luxury border-b-2 border-gray-200/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="p-3 sm:p-3.5 bg-gradient-to-br from-golf-green-500 via-golf-green-600 to-golf-green-700 rounded-2xl shadow-glow-green hover:scale-110 transition-transform duration-300 animate-float">
              <Trophy className="text-white" size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 truncate tracking-tight">Golf Handicap Tracker</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-1.5 hidden sm:block font-medium">Track your golf game development with precision</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-8 glass-dark border-3 border-red-400 rounded-3xl p-5 sm:p-6 flex items-start gap-4 animate-slide-up shadow-luxury bg-red-50/50">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertCircle className="text-red-600 flex-shrink-0" size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-red-900 font-black text-base sm:text-lg tracking-tight">Error</h3>
              <p className="text-red-700 text-sm sm:text-base mt-2 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold text-2xl hover:bg-red-200 rounded-xl p-2 transition-all flex-shrink-0 hover:scale-110"
              aria-label="Close error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="glass-dark rounded-3xl shadow-luxury p-16 sm:p-20 text-center animate-fade-in border-2 border-gray-200/60">
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-golf-green-600 border-r-golf-green-400 border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <p className="text-gray-700 mt-8 text-lg sm:text-xl font-bold tracking-tight">Loading your golf data...</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Handicap Card */}
            <HandicapCard
              currentHandicap={currentHandicap}
              previousHandicap={previousHandicap}
              roundsPlayed={officialRounds.length}
            />

            {/* What-If Card */}
            <WhatIfCard allRounds={rounds} currentHandicap={currentHandicap} />

            {/* Chart */}
            {history.length > 0 && <HandicapChart history={history} />}

            {/* Add Round Form */}
            <RoundForm onAddRound={handleAddRound} />

            {/* Rounds List */}
            <RoundsList rounds={rounds} onDeleteRound={handleDeleteRound} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 sm:mt-20 py-10 sm:py-12 border-t-2 border-gray-200/60 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <p className="text-gray-800 text-base sm:text-lg font-bold tracking-tight">
              Handicap calculation based on World Handicap System (WHS)
            </p>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              Data stored server-side in SQLite database
            </p>
            <div className="pt-4">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-golf-green-600 to-golf-green-700 text-white rounded-full text-xs font-bold shadow-soft">
                Updated 2026
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
