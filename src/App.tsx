import { useState, useEffect } from 'react';
import type { GolfRound } from './types';
import { HandicapCard } from './components/HandicapCard';
import { RoundForm } from './components/RoundForm';
import { RoundsList } from './components/RoundsList';
import { HandicapChart } from './components/HandicapChart';
import {
  calculateHandicapIndex,
  generateHandicapHistory,
  saveRounds,
  loadRounds
} from './utils/handicapCalculator';
import { Trophy } from 'lucide-react';

function App() {
  const [rounds, setRounds] = useState<GolfRound[]>([]);

  useEffect(() => {
    const savedRounds = loadRounds();
    setRounds(savedRounds);
  }, []);

  const handleAddRound = (round: GolfRound) => {
    const updatedRounds = [...rounds, round];
    setRounds(updatedRounds);
    saveRounds(updatedRounds);
  };

  const handleDeleteRound = (id: string) => {
    const updatedRounds = rounds.filter(round => round.id !== id);
    setRounds(updatedRounds);
    saveRounds(updatedRounds);
  };

  const currentHandicap = calculateHandicapIndex(rounds);
  const history = generateHandicapHistory(rounds);
  const previousHandicap = history.length > 1 ? history[history.length - 2].handicap : null;

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
        <div className="space-y-6">
          {/* Handicap Card */}
          <HandicapCard
            currentHandicap={currentHandicap}
            previousHandicap={previousHandicap}
            roundsPlayed={rounds.length}
          />

          {/* Chart */}
          {history.length > 0 && <HandicapChart history={history} />}

          {/* Add Round Form */}
          <RoundForm onAddRound={handleAddRound} />

          {/* Rounds List */}
          <RoundsList rounds={rounds} onDeleteRound={handleDeleteRound} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">
            Handicap-Berechnung basiert auf dem World Handicap System (WHS)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
