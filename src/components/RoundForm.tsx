import { useState, type FormEvent } from 'react';
import { PlusCircle } from 'lucide-react';
import type { GolfRound } from '../types';

interface RoundFormProps {
  onAddRound: (round: GolfRound) => void;
}

export function RoundForm({ onAddRound }: RoundFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    courseName: '',
    courseRating: '',
    slopeRating: '113',
    score: '',
    par: '72',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newRound: GolfRound = {
      id: Date.now().toString(),
      date: formData.date,
      courseName: formData.courseName,
      courseRating: parseFloat(formData.courseRating),
      slopeRating: parseInt(formData.slopeRating),
      score: parseInt(formData.score),
      par: parseInt(formData.par),
    };

    onAddRound(newRound);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      courseName: '',
      courseRating: '',
      slopeRating: '113',
      score: '',
      par: '72',
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-golf-green-500 hover:bg-golf-green-50 transition-all duration-200 flex items-center justify-center gap-3 text-gray-600 hover:text-golf-green-700"
      >
        <PlusCircle size={24} />
        <span className="text-lg font-semibold">Neue Runde hinzufügen</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Neue Golfrunde</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platzname
          </label>
          <input
            type="text"
            required
            placeholder="z.B. Golf Club München"
            value={formData.courseName}
            onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Rating
          </label>
          <input
            type="number"
            step="0.1"
            required
            placeholder="z.B. 71.5"
            value={formData.courseRating}
            onChange={(e) => setFormData({ ...formData, courseRating: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slope Rating
          </label>
          <input
            type="number"
            required
            placeholder="z.B. 113"
            value={formData.slopeRating}
            onChange={(e) => setFormData({ ...formData, slopeRating: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score
          </label>
          <input
            type="number"
            required
            placeholder="z.B. 85"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Par
          </label>
          <input
            type="number"
            required
            placeholder="z.B. 72"
            value={formData.par}
            onChange={(e) => setFormData({ ...formData, par: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 bg-golf-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-golf-green-700 transition-colors"
        >
          Runde speichern
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
