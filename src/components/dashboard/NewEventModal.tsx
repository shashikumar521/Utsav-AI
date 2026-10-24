import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { EventType } from '../../types';
import { Sparkles, X, Calendar, MapPin, Users, DollarSign } from 'lucide-react';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose }) => {
  const { createEvent, currency } = useEvents();

  const [form, setForm] = useState({
    title: '',
    eventType: 'Wedding' as EventType,
    date: '',
    city: '',
    venue: '',
    totalBudget: 1500000,
    guestCount: 250,
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.city.trim()) return;

    createEvent({
      title: form.title.trim(),
      eventType: form.eventType,
      date: form.date,
      city: form.city.trim(),
      venue: form.venue.trim() || `${form.city} Grand Ballroom & Courtyard`,
      totalBudget: form.totalBudget || 500000,
      guestCount: form.guestCount || 100,
      status: 'Planning',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      notes: form.notes.trim() || `Planned with Utsav AI Intelligence concierge on ${new Date().toLocaleDateString()}`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-plum/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-plum/15 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-plum/40 hover:text-plum transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-md bg-gold/20 text-gold-dark border border-gold/30">
            <Sparkles size={16} />
          </span>
          <h2 className="font-serif text-2xl font-semibold text-plum">
            Initialize New Celebration
          </h2>
        </div>
        <p className="text-xs text-plum/60 mb-5">
          Enter core parameters to initialize a customized AI event dossier and timeline.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-plum mb-1">Celebration Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Diya & Neil's Royal Sangeet & Vivaha"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-plum mb-1">Celebration Type</label>
              <select
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value as EventType })}
                className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum text-plum font-medium"
              >
                <option value="Wedding">Wedding & Vivaha</option>
                <option value="Birthday">Milestone Birthday</option>
                <option value="Anniversary">Anniversary Jubilee</option>
                <option value="Corporate Gala">Corporate Gala & Honors</option>
                <option value="Festival / Diwali">Festival / Diwali Soirée</option>
                <option value="Intimate Dinner">Intimate Dinner & Salon</option>
                <option value="Baby Shower">Godh Bharai / Baby Shower</option>
                <option value="Other">Custom Celebration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-plum mb-1">Target Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-plum mb-1">Destination / City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Udaipur, Mumbai, Jaipur"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-plum mb-1">Venue / Estate</label>
              <input
                type="text"
                placeholder="e.g. The Leela Palace"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-plum mb-1">Total Target Budget ({currency})</label>
              <input
                type="number"
                min="10000"
                step="50000"
                value={form.totalBudget}
                onChange={(e) => setForm({ ...form, totalBudget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-plum mb-1">Estimated Guest Count</label>
              <input
                type="number"
                min="5"
                max="5000"
                value={form.guestCount}
                onChange={(e) => setForm({ ...form, guestCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-plum mb-1">Aesthetic Vision & Special Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Sunset lakefront ceremony with marigold mandap, royal Rajasthani banquet, acoustic sufi ensemble..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-plum/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-plum/70 hover:text-plum hover:bg-plum/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-plum text-ivory-warm rounded-lg hover:bg-plum-light transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-gold" />
              Generate Event Dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
