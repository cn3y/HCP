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
        className="group w-full bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-3xl p-6 sm:p-8 hover:border-golf-green-500 hover:from-golf-green-50 hover:to-golf-green-50/50 transition-all duration-300 flex items-center justify-center gap-3 text-gray-600 hover:text-golf-green-700 shadow-sm hover:shadow-soft animate-fade-in active:scale-[0.98]"
      >
        <PlusCircle size={24} className="group-hover:scale-110 transition-transform" />
        <span className="text-base sm:text-lg font-semibold">Add New Round</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-dark rounded-3xl shadow-soft p-4 sm:p-6 border border-gray-100 animate-fade-in">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">New Golf Round</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-golf-green-500 focus:border-transparent transition-all bg-white/80 text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Course Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Pebble Beach Golf Links"
            value={formData.courseName}
            onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-golf-green-500 focus:border-transparent transition-all bg-white/80 text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Course Rating
          </label>
          <input
            type="number"
            step="0.1"
            required
            placeholder="e.g. 71.5"
            value={formData.courseRating}
            onChange={(e) => setFormData({ ...formData, courseRating: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-golf-green-500 focus:border-transparent transition-all bg-white/80 text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Slope Rating
          </label>
          <input
            type="number"
            required
            placeholder="e.g. 113"
            value={formData.slopeRating}
            onChange={(e) => setFormData({ ...formData, slopeRating: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-golf-green-500 focus:border-transparent transition-all bg-white/80 text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Score
          </label>
          <input
            type="number"
            required
            placeholder="e.g. 85"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-golf-green-500 focus:border-transparent transition-all bg-white/80 text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Par
          </label>
          <input
            type="number"
            required
            placeholder="e.g. 72"
            value={formData.par}
            onChange={(e) => setFormData({ ...formData, par: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-golf-green-500 focus:border-transparent transition-all bg-white/80 text-base"
          />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
            Round Type
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1 flex items-center space-x-3 cursor-pointer p-4 border-2 rounded-xl transition-all hover:bg-gray-50 has-[:checked]:border-golf-green-500 has-[:checked]:bg-golf-green-50">
              <input
                type="radio"
                value="official"
                checked={formData.roundType === 'official'}
                onChange={(e) => setFormData({ ...formData, roundType: e.target.value as 'official' | 'training' })}
                className="w-5 h-5 text-golf-green-600 focus:ring-golf-green-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-800 block">Official Round</span>
                <span className="text-xs text-gray-500">Counts for handicap</span>
              </div>
            </label>
            <label className="flex-1 flex items-center space-x-3 cursor-pointer p-4 border-2 rounded-xl transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                value="training"
                checked={formData.roundType === 'training'}
                onChange={(e) => setFormData({ ...formData, roundType: e.target.value as 'official' | 'training' })}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-800 block">Training Round</span>
                <span className="text-xs text-gray-500">What-if scenario</span>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Weather conditions, special notes..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-golf-green-500 focus:border-transparent resize-none transition-all bg-white/80 text-base"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-golf-green-600 to-golf-green-700 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-golf-green-700 hover:to-golf-green-800 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          Save Round
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-6 py-3.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
