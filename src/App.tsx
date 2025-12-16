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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-dark shadow-soft border-b border-gray-200/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-golf-green-500 to-golf-green-600 rounded-2xl shadow-sm">
              <Trophy className="text-white" size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Golf Handicap Tracker</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">Track your golf game development</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-6 glass-dark border-2 border-red-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3 animate-slide-up shadow-soft">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
            <div className="flex-1 min-w-0">
              <h3 className="text-red-800 font-bold text-sm sm:text-base">Error</h3>
              <p className="text-red-700 text-xs sm:text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold text-xl hover:bg-red-100 rounded-lg p-1 transition-colors flex-shrink-0"
              aria-label="Close error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="glass-dark rounded-3xl shadow-soft p-12 sm:p-16 text-center animate-fade-in">
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-golf-green-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 mt-6 text-base sm:text-lg font-medium">Loading your golf data...</p>
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
      <footer className="mt-12 sm:mt-16 py-8 sm:py-10 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <p className="text-gray-700 text-sm sm:text-base font-medium">
              Handicap calculation based on World Handicap System (WHS)
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Data stored server-side in SQLite database
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
