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

  // Lade Runden beim Start
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
      setError('Fehler beim Laden der Runden. Stellen Sie sicher, dass der Backend-Server läuft.');
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
      setError('Fehler beim Hinzufügen der Runde');
    }
  };

  const handleDeleteRound = async (id: string) => {
    try {
      setError(null);
      await apiService.deleteRound(id);
      setRounds(rounds.filter(round => round.id !== id));
    } catch (err) {
      console.error('Failed to delete round:', err);
      setError('Fehler beim Löschen der Runde');
    }
  };

  const currentHandicap = calculateHandicapIndex(rounds);
  const history = generateHandicapHistory(rounds);
  const previousHandicap = history.length > 1 ? history[history.length - 2].handicap : null;
  const officialRounds = rounds.filter(r => r.roundType === 'official');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-golf-green-100 rounded-lg">
              <Trophy className="text-golf-green-700" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Golf Handicap Tracker</h1>
              <p className="text-gray-600 mt-1">Verfolgen Sie Ihre Entwicklung im Golfspiel</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold">Fehler</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Lade Daten...</p>
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
      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">
            Handicap-Berechnung basiert auf dem World Handicap System (WHS)
          </p>
          <p className="text-center text-gray-500 text-xs mt-2">
            Daten werden serverseitig in SQLite gespeichert
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
