import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { MoodboardItem } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface MoodboardViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const MoodboardView: React.FC<MoodboardViewProps> = ({ onShowToast }) => {
  const {
    activeEvent,
    moodboards,
    addMoodboardItem,
    deleteMoodboardItem,
    updateEvent,
  } = useEvents();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MoodboardItem | null>(null);

  // Add Item form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<MoodboardItem['category']>('Floral & Decor');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Preset Palettes
  const presetPalettes = [
    {
      name: 'Sunset Marigold & Deep Plum',
      colors: ['#392538', '#C5A46D', '#C97862', '#FAF7F0', '#4A6B53'],
      description: 'Regal Rajputana warmth with hammered brass accents & marigolds',
    },
    {
      name: 'Tuscan Olive & Warm Alabaster',
      colors: ['#2F3E33', '#8A9A86', '#D4AF37', '#FAF7F0', '#C29B7F'],
      description: 'Airy botanical canopy with olive sprigs & washed linen',
    },
    {
      name: 'Black-Tie Monolith & Champagne',
      colors: ['#1C1C18', '#392538', '#C5A46D', '#ECE6DA', '#FFFFFF'],
      description: 'Sculptural stone pedestals with amber candlelight and crystal',
    },
    {
      name: 'Heirloom Vermilion & Saffron',
      colors: ['#7A1F1D', '#D97706', '#E5C188', '#FAF7F0', '#340700'],
      description: 'Vedic ceremony vibrancy with raw silk and saffron garlands',
    },
  ];

  const handleApplyPalette = (colors: string[], name: string) => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      palette: colors,
      theme: name,
    });
    onShowToast(`Applied palette "${name}" to event dossier`, 'success');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Title is required.');
      return;
    }

    addMoodboardItem({
      title: formTitle.trim(),
      category: formCategory,
      imageUrl: formImageUrl.trim() || undefined,
      notes: formNotes.trim(),
    });

    onShowToast(`Added inspiration "${formTitle}"`, 'success');
    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteMoodboardItem(itemToDelete.id);
    onShowToast(`Removed inspiration tile`, 'info');
    setItemToDelete(null);
  };

  const currentPalette = activeEvent?.palette || ['#392538', '#C5A46D', '#C97862', '#FAF7F0', '#4A6B53'];

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* Header & Theme Dossier */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
              Aesthetic Direction
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#392538]">
              Moodboard Studio &amp; Sensory Palette
            </h2>
            <p className="text-xs text-[#4C454A] mt-0.5">
              Current Theme: <span className="font-semibold text-[#392538]">{activeEvent?.theme}</span>
            </p>
          </div>

          <button
            onClick={() => {
              setFormTitle('');
              setFormCategory('Floral & Decor');
              setFormImageUrl('');
              setFormNotes('');
              setFormError('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#392538] text-white text-xs font-semibold hover:bg-[#231123] transition shadow-xs self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm text-[#C5A46D]">add_photo_alternate</span>
            <span>Add Inspiration Tile</span>
          </button>
        </div>

        {/* Active 5-Color Chromatic Palette Strip */}
        <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#392538]">
              Active Celebration Color Palette
            </span>
            <span className="text-[10px] text-[#755a2a] uppercase tracking-wider font-semibold">
              5 Harmonious Swatches
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {currentPalette.map((hex, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white border border-[#E8E1D5] shadow-2xs group cursor-pointer hover:border-[#C5A46D] transition"
                onClick={() => {
                  navigator.clipboard?.writeText(hex);
                  onShowToast(`Copied ${hex} to clipboard`, 'info');
                }}
                title="Click to copy hex"
              >
                <div
                  className="w-full h-12 sm:h-16 rounded-lg shadow-inner border border-black/5"
                  style={{ backgroundColor: hex }}
                />
                <span className="font-mono text-[10px] sm:text-xs font-bold text-[#392538]">
                  {hex}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Preset Palettes */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#755a2a] uppercase tracking-wider">
            Quick-Apply Curated Palettes
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {presetPalettes.map(preset => (
              <button
                key={preset.name}
                onClick={() => handleApplyPalette(preset.colors, preset.name)}
                className="p-3 rounded-xl bg-white border border-[#E8E1D5] hover:border-[#C5A46D] text-left transition-all flex flex-col gap-2 group"
              >
                <div className="flex items-center gap-1">
                  {preset.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-md shadow-2xs border border-black/5"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#392538] group-hover:text-[#755a2a] transition-colors leading-tight">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-[#4C454A] mt-0.5 line-clamp-1">
                    {preset.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inspiration Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {moodboards.map(item => (
          <article
            key={item.id}
            className="group rounded-2xl bg-white border border-[#E8E1D5] hover:shadow-md transition overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Optional Visual Image Container */}
              {item.imageUrl ? (
                <div className="relative h-48 w-full overflow-hidden bg-[#FAF7F0]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#392538]/90 text-white text-[10px] font-semibold tracking-wide uppercase">
                    {item.category}
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-br from-[#FAF7F0] to-[#F4EFE6] border-b border-[#E8E1D5] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="material-symbols-outlined text-[#C5A46D]">palette</span>
                </div>
              )}

              {/* Tile Content */}
              <div className="p-4 flex flex-col gap-2">
                <h3 className="font-serif text-base font-bold text-[#392538] leading-tight">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-[#4C454A] leading-relaxed">
                  {item.notes}
                </p>

                {item.paletteColors && item.paletteColors.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[#E8E1D5] mt-1">
                    {item.paletteColors.map((color, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-[#E8E1D5] bg-[#FAF7F0]/40 flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#4C454A]">Saved in Event Dossier</span>
              <button
                onClick={() => setItemToDelete(item)}
                className="p-1 rounded text-[#4C454A] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Remove inspiration tile"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Add Inspiration Item Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#392538]/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#E8E1D5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-4">
              <h3 className="font-serif text-lg font-bold text-[#392538]">
                Add Moodboard Tile
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#4C454A] hover:bg-[#F4EFE6]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded bg-red-50 text-red-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddItem} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Tile Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Hammered Brass Centerpieces & Tuberose Garlands"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                >
                  <option value="Floral & Decor">Floral &amp; Decor</option>
                  <option value="Color Palette">Color Palette</option>
                  <option value="Attire & Styling">Attire &amp; Styling</option>
                  <option value="Lighting & Ambience">Lighting &amp; Ambience</option>
                  <option value="Dining & Table">Dining &amp; Table</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={e => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">
                  Aesthetic Notes &amp; Styling Brief
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Notes on tactile fabric, lighting warmth, florist instructions..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D5]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#F4EFE6] text-[#392538] hover:bg-[#ECE6DA] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#392538] text-white font-semibold hover:bg-[#231123]"
                >
                  Save Inspiration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!itemToDelete}
        title="Remove Moodboard Inspiration"
        message={`Are you sure you want to remove "${itemToDelete?.title}" from your celebration moodboard?`}
        confirmLabel="Remove Tile"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
