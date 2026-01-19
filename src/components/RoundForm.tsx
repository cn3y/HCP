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
        className="group relative w-full bg-gradient-to-br from-white via-gray-50 to-white border-3 border-dashed border-gray-300 rounded-3xl p-8 sm:p-10 hover:border-golf-green-500 hover:from-golf-green-50 hover:via-white hover:to-golf-green-50/30 transition-all duration-500 flex items-center justify-center gap-4 text-gray-600 hover:text-golf-green-700 shadow-soft hover:shadow-luxury animate-fade-in active:scale-[0.97] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-golf-green-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-shimmer"></div>
        <PlusCircle size={28} className="relative group-hover:scale-125 group-hover:rotate-90 transition-all duration-500" />
        <span className="relative text-lg sm:text-xl font-bold tracking-tight">Add New Round</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-dark rounded-3xl shadow-luxury p-6 sm:p-8 border-2 border-gray-200/60 animate-fade-in hover:border-golf-green-200 transition-colors duration-300">
      <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mb-8 tracking-tight">New Golf Round</h3>

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
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white text-base font-medium shadow-sm hover:shadow-md"
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
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white text-base font-medium shadow-sm hover:shadow-md"
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
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white text-base font-medium shadow-sm hover:shadow-md"
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
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white text-base font-medium shadow-sm hover:shadow-md"
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
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white text-base font-medium shadow-sm hover:shadow-md"
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
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white text-base font-medium shadow-sm hover:shadow-md"
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
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 resize-none transition-all bg-white/90 hover:bg-white text-base font-medium shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-golf-green-600 via-golf-green-600 to-golf-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-golf-green-700 hover:to-golf-green-800 transition-all shadow-soft hover:shadow-glow-green active:scale-[0.97] hover:scale-[1.02] border-2 border-golf-green-500"
        >
          Save Round
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-8 py-4 border-3 border-gray-300 rounded-xl font-bold text-lg text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all active:scale-[0.97] hover:scale-[1.02] shadow-sm hover:shadow-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
