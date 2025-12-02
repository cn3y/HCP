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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-xl bg-white/70 shadow-lg border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30 transform hover:scale-105 transition-transform duration-200">
              <Trophy className="text-white" size={36} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Golf Handicap Tracker
              </h1>
              <p className="text-gray-600 mt-1 text-lg">Track your golf game development</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 backdrop-blur-xl bg-red-50/90 border border-red-200/50 rounded-2xl p-5 flex items-center gap-3 shadow-xl animate-in slide-in-from-top duration-300">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-12 text-center border border-white/50">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-emerald-600 animate-spin"></div>
            </div>
            <p className="text-gray-600 mt-6 text-lg font-medium">Loading data...</p>
          </div>
        ) : (
          <div className="space-y-6">
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
      <footer className="relative mt-16 py-10 backdrop-blur-xl bg-white/40 border-t border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-700 text-sm font-medium">
            Handicap calculation based on World Handicap System (WHS)
          </p>
          <p className="text-center text-gray-500 text-xs mt-2">
            Data stored server-side in SQLite database
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
