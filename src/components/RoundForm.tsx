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
    roundType: 'official' as 'official' | 'training',
    notes: '',
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
      roundType: formData.roundType,
      notes: formData.notes || undefined,
    };

    onAddRound(newRound);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      courseName: '',
      courseRating: '',
      slopeRating: '113',
      score: '',
      par: '72',
      roundType: 'official',
      notes: '',
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group w-full backdrop-blur-xl bg-white/70 border-2 border-dashed border-emerald-300/50 rounded-3xl p-10 hover:border-emerald-500 hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-300 flex items-center justify-center gap-4 text-gray-600 hover:text-emerald-700 shadow-lg hover:shadow-2xl"
      >
        <PlusCircle size={28} className="group-hover:scale-110 transition-transform" />
        <span className="text-xl font-bold">Add New Round</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/50">
      <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">New Golf Round</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
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
            Course Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Pebble Beach Golf Links"
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
            placeholder="e.g. 71.5"
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
            placeholder="e.g. 113"
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
            placeholder="e.g. 85"
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
            placeholder="e.g. 72"
            value={formData.par}
            onChange={(e) => setFormData({ ...formData, par: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Round Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="official"
                checked={formData.roundType === 'official'}
                onChange={(e) => setFormData({ ...formData, roundType: e.target.value as 'official' | 'training' })}
                className="w-4 h-4 text-golf-green-600 focus:ring-golf-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Official Round <span className="text-xs text-gray-500">(counts for handicap)</span>
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="training"
                checked={formData.roundType === 'training'}
                onChange={(e) => setFormData({ ...formData, roundType: e.target.value as 'official' | 'training' })}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Training Round <span className="text-xs text-gray-500">("what-if" scenario)</span>
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Weather conditions, special notes..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Save Round
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-8 py-4 border-2 border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
