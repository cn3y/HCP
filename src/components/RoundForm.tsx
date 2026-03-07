import { useState, type FormEvent } from 'react';
import { PlusCircle, MapPin, Trophy, Calendar, Flag } from 'lucide-react';
import type { GolfRound, RoundFormat } from '../types';

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
    holes: '18' as RoundFormat,
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
      holes: formData.holes,
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
      holes: '18',
      roundType: 'official',
      notes: '',
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group relative w-full bg-gradient-to-br from-golf-green-50 via-white to-golf-green-50 border-3 border-dashed border-golf-green-300 rounded-3xl p-8 sm:p-10 hover:border-golf-green-500 hover:from-golf-green-100 hover:via-golf-green-50 hover:to-golf-green-100 transition-all duration-500 flex items-center justify-center gap-4 text-gray-700 hover:text-golf-green-700 shadow-soft hover:shadow-glow-green animate-fade-in overflow-hidden"
      >
        {/* Golf ball dimple pattern in background */}
        <div className="absolute inset-0 golf-dimple-pattern opacity-50" />
        
        <div className="relative flex items-center gap-4">
          <div className="p-4 bg-golf-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform shadow-glow-green">
            <PlusCircle size={32} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">New Round</h3>
            <p className="text-sm text-gray-600 font-semibold">Track your golf game</p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-dark rounded-3xl shadow-luxury p-6 sm:p-8 border-2 border-golf-green-300 animate-fade-in overflow-hidden">
      {/* Golf-themed header */}
      <div className="relative bg-gradient-to-r from-golf-green-600 to-golf-green-700 rounded-tl-3xl rounded-tr-3xl -mx-6 -mt-6 mb-8 p-6 shadow-glow-green">
        <div className="golf-ball opacity-30 absolute inset-0" />
        <div className="relative flex items-center gap-4">
          <Trophy className="text-golf-gold-400 w-8 h-8" />
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Record Your Round</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" /> Date
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" /> Course Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Pebble Beach Golf Links"
            value={formData.courseName}
            onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white"
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
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white"
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
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Score
          </label>
          <input
            type="number"
            required
            min="27"
            max="130"
            placeholder="e.g. 85"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Par
          </label>
          <input
            type="number"
            required
            min="68"
            max="78"
            placeholder="e.g. 72"
            value={formData.par}
            onChange={(e) => setFormData({ ...formData, par: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            <Flag className="inline w-4 h-4 mr-1" /> Holes
          </label>
          <select
            value={formData.holes}
            onChange={(e) => setFormData({ ...formData, holes: e.target.value as RoundFormat })}
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 transition-all bg-white/90 hover:bg-white"
          >
            <option value="9">9 holes</option>
            <option value="18">18 holes</option>
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
            Round Type
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className={`flex-1 flex items-center space-x-3 cursor-pointer p-4 border-2 rounded-xl transition-all hover:bg-gray-50 ${formData.roundType === 'official' ? 'bg-golf-green-50 border-golf-green-500 shadow-glow-green' : 'bg-white'}`}>
              <input
                type="radio"
                value="official"
                checked={formData.roundType === 'official'}
                onChange={(e) => setFormData({ ...formData, roundType: e.target.value as 'official' | 'training' })}
                className="w-5 h-5 text-golf-green-600"
              />
              <div>
                <span className={`text-sm font-bold ${formData.roundType === 'official' ? 'text-golf-green-800' : 'text-gray-800'} block`}>Official Round</span>
                <span className="text-xs text-gray-600 block">Counts for handicap index</span>
              </div>
            </label>
            <label className={`flex-1 flex items-center space-x-3 cursor-pointer p-4 border-2 rounded-xl transition-all hover:bg-gray-50 ${formData.roundType === 'training' ? 'bg-blue-50 border-golf-blue-600' : 'bg-white'}`}>
              <input
                type="radio"
                value="training"
                checked={formData.roundType === 'training'}
                onChange={(e) => setFormData({ ...formData, roundType: e.target.value as 'official' | 'training' })}
                className="w-5 h-5 text-blue-600"
              />
              <div>
                <span className={`text-sm font-bold ${formData.roundType === 'training' ? 'text-blue-800' : 'text-gray-800'} block`}>Training / Practice</span>
                <span className="text-xs text-gray-600 block">Does not affect handicap</span>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Comments (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Course conditions, weather, special shots..."
            rows={3}
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-golf-green-500/20 focus:border-golf-green-500 resize-none transition-all bg-white/90 hover:bg-white"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-golf-green-600 via-golf-gold-500 to-golf-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-golf-green-700 hover:via-golf-gold-600 hover:to-golf-green-700 transition-all shadow-glow-green active:scale-[0.97] hover:scale-[1.02]"
        >
          <Trophy className="inline mr-2 w-5 h-5" />
          Save Round
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-8 py-4 border-3 border-gray-300 rounded-xl font-bold text-lg text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all active:scale-[0.97] hover:scale-[1.02]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
