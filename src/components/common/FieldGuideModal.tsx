import React, { useState } from 'react';
import { editorialFieldGuides, FieldGuide } from '../../data/initialData';

interface FieldGuideModalProps {
  isOpen: boolean;
  initialGuideId?: string;
  onClose: () => void;
}

export const FieldGuideModal: React.FC<FieldGuideModalProps> = ({
  isOpen,
  initialGuideId,
  onClose,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    initialGuideId || editorialFieldGuides[0].id
  );

  if (!isOpen) return null;

  const activeGuide: FieldGuide =
    editorialFieldGuides.find(g => g.id === selectedGuideId) || editorialFieldGuides[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#392538]/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#E8E1D5] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E1D5] bg-[#FAF7F0]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#755a2a] text-xl">auto_stories</span>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#392538]">
              The Luxury Archive · Editorial Field Guides
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#4C454A] hover:text-[#392538] hover:bg-[#F4EFE6] transition-colors"
            aria-label="Close guides modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body: Left Guide Selector + Right Article View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Guide Directory List */}
          <div className="md:col-span-4 border-r border-[#E8E1D5] bg-[#FAF7F0]/50 overflow-y-auto p-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a] px-2 py-1">
              Curated Articles ({editorialFieldGuides.length})
            </span>
            {editorialFieldGuides.map(guide => {
              const isSelected = guide.id === selectedGuideId;
              return (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={`text-left p-3 rounded-xl transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-white shadow-xs border border-[#C5A46D] text-[#392538]'
                      : 'hover:bg-[#F4EFE6] text-[#4C454A]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-[#755a2a] uppercase tracking-wider">{guide.category}</span>
                    <span className="text-[#4C454A]/70">{guide.readTime}</span>
                  </div>
                  <h4 className="font-serif text-xs font-bold line-clamp-2 leading-snug">
                    {guide.title}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Active Guide Article View */}
          <div className="md:col-span-8 overflow-y-auto p-6 sm:p-8 flex flex-col gap-5 bg-white">
            <div className="flex flex-col gap-2 border-b border-[#E8E1D5] pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#755a2a]">
                <span className="uppercase tracking-widest">{activeGuide.category}</span>
                <span>·</span>
                <span>{activeGuide.readTime}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#392538] font-bold leading-tight">
                {activeGuide.title}
              </h1>
              <p className="font-sans text-sm text-[#4C454A] italic leading-relaxed">
                {activeGuide.subtitle}
              </p>
            </div>

            {/* Editorial Executive Summary */}
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#755a2a] block mb-1">
                Executive Takeaway
              </span>
              <p className="font-sans text-xs sm:text-sm text-[#392538] font-medium leading-relaxed">
                {activeGuide.summary}
              </p>
            </div>

            {/* Deep Dive Content Points */}
            <div className="flex flex-col gap-4 text-sm text-[#4C454A] leading-relaxed">
              {activeGuide.content.map((paragraph, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="font-serif text-base font-bold text-[#C5A46D] select-none mt-0.5">
                    0{idx + 1}.
                  </span>
                  <p className="flex-1">{paragraph}</p>
                </div>
              ))}
            </div>

            {/* Practical Action Footer */}
            <div className="mt-4 pt-4 border-t border-[#E8E1D5] flex items-center justify-between text-xs text-[#4C454A]">
              <span>Grounded in Utsav AI celebration benchmarks</span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#392538] text-white font-semibold hover:bg-[#231123] transition-colors"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
