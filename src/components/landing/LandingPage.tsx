import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { EventType, ActiveTab } from '../../types';
import { editorialFieldGuides } from '../../data/initialData';

interface LandingPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenGuidesModal: (guideId?: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenGuidesModal,
  onShowToast,
}) => {
  const { createEvent, formatCurrency } = useEvents();

  // Quick Event Creation Form State
  const [selectedType, setSelectedType] = useState<EventType>('Wedding');
  const [eventDate, setEventDate] = useState<string>('2025-11-18');
  const [cityLocation, setCityLocation] = useState<string>('Jaipur / Delhi NCR');
  const [guestScale, setGuestScale] = useState<number>(120);
  const [budgetVal, setBudgetVal] = useState<number>(600000);
  const [atmosphere, setAtmosphere] = useState<string>('Heritage & Regal');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const celebrationCategories: { label: string; type: EventType; icon: string }[] = [
    { label: 'Wedding', type: 'Wedding', icon: '💍' },
    { label: 'Birthday', type: 'Milestone Birthday', icon: '🎂' },
    { label: 'Festival & Puja', type: 'Festival', icon: '🪔' },
    { label: 'Corporate Gala', type: 'Corporate Gala', icon: '🥂' },
    { label: 'Anniversary', type: 'Anniversary', icon: '✨' },
    { label: 'Intimate Dinner', type: 'Intimate Soirée', icon: '🌿' },
  ];

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!cityLocation.trim()) {
      setFormError('Please specify a city or target venue location.');
      return;
    }
    if (!eventDate) {
      setFormError('Please select a target celebration date.');
      return;
    }
    if (budgetVal < 10000) {
      setFormError('Budget must be at least ₹10,000.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdId = createEvent({
        name: `${cityLocation.split('/')[0].trim()} ${selectedType}`,
        type: selectedType,
        date: eventDate,
        location: cityLocation,
        guestCount: guestScale,
        budget: budgetVal,
        theme: atmosphere,
        description: `Bespoke ${selectedType.toLowerCase()} in ${cityLocation} for ${guestScale} guests with ${atmosphere} aesthetic.`,
        status: 'Planning',
        palette: ['#392538', '#C5A46D', '#C97862', '#FAF7F0', '#4A6B53'],
        notes: `Created via express dossier. Atmosphere: ${atmosphere}. Target budget: ₹${budgetVal.toLocaleString('en-IN')}.`,
      });

      onShowToast(`Celebration plan created for ${selectedType}! Opening Atelier...`, 'success');
      setTimeout(() => {
        setIsSubmitting(false);
        onNavigate('overview');
      }, 700);
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Failed to initialize celebration plan. Please try again.');
    }
  };

  const handleTemplateSelect = (type: EventType, title: string, budget: number, guests: number, location: string) => {
    const createdId = createEvent({
      name: title,
      type: type,
      date: '2025-11-28',
      location: location,
      guestCount: guests,
      budget: budget,
      theme: 'Editorial Heritage Elegance',
      description: `Curated archetype for ${type.toLowerCase()} in ${location}.`,
      status: 'Planning',
      palette: ['#392538', '#C5A46D', '#C97862', '#FAF7F0', '#4A6B53'],
      notes: `Initiated from ${title} template archetype.`,
    });
    onShowToast(`Loaded ${title} into Command Center`, 'success');
    onNavigate('overview');
  };

  return (
    <div className="w-full flex flex-col">
      {/* =========================================================================
           SECTION A: COMPACT EDITORIAL HERO
      ========================================================================= */}
      <section className="relative w-full px-4 sm:px-6 pt-8 pb-12 overflow-hidden bg-gradient-to-b from-[#FAF7F0] via-[#FAF7F0] to-[#F4EFE6]/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#F4EFE6] border border-[#C5A46D]/30 text-[#755a2a] text-xs font-semibold tracking-wide">
              <span className="material-symbols-outlined text-sm text-[#C97862]">celebration</span>
              <span>Bespoke AI Event Architecture</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#392538] font-medium tracking-tight leading-[1.18]">
              Your next unforgettable celebration <span className="italic text-[#755a2a] font-normal">starts here.</span>
            </h1>

            <p className="font-sans text-sm sm:text-base text-[#4C454A] max-w-xl leading-relaxed">
              Plan weddings, birthdays, festivals, corporate events, and intimate gatherings with your personal AI planner. Harmonizing regional nuance, meticulous budgets, and joyous aesthetics in minutes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#quick-plan"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#392538] text-[#FAF7F0] font-sans text-sm font-semibold hover:bg-[#231123] shadow-sm hover:shadow transition focus-visible:ring-2 focus-visible:ring-[#C5A46D]"
              >
                <span>Start Planning</span>
                <span className="material-symbols-outlined text-base text-[#C5A46D]">auto_awesome</span>
              </a>
              <a
                href="#featured-events"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F4EFE6] text-[#392538] font-sans text-sm font-semibold hover:bg-[#ECE6DA] transition"
              >
                <span>Explore Celebrations</span>
                <span className="material-symbols-outlined text-sm">north_east</span>
              </a>
            </div>

            {/* Social Proof Strip */}
            <div className="flex items-center gap-6 pt-3 border-t border-[#E8E1D5] text-xs text-[#4C454A] font-medium">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#755a2a] text-base">verified</span>
                <span>98.4% Budget Precision</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#755a2a] text-base">schedule</span>
                <span>Plans generated under 60 seconds</span>
              </div>
            </div>
          </div>

          {/* Right Column: Refined Celebration Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E8E1D5] shadow-[0_16px_40px_-8px_rgba(57,37,56,0.12)]">
              <div className="relative h-60 sm:h-72 w-full overflow-hidden">
                <img
                  alt="Bespoke luxury palace evening celebration with glowing lanterns and florals"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7Fh-7HBAy02yqxkp4RBPchAabQtrouLHmHybjkFGyRs3cJ_R1AlyHQ07XFly994n3m6uXPO6DuftsykTQydh1IX_qF1rvn6s7txorWLv3UkjbLckWOuCmeyMXJ9LDV_-FIDkSjmhNO-7KgVrE0wnPD--Hfr8B4rswUdzMXTQ01EIUkZ6qf1Cxhji5UaWAbN2vqgIGXaLlJvVW3n4PG3jAtcbgZnwWQG_Bt11UeJQjTGNxfsIFzchA8A"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#392538]/90 via-[#392538]/30 to-transparent flex flex-col justify-end p-4 text-[#FAF7F0]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C5A46D]">
                    Blueprint In Progress
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-medium leading-snug">
                    The Amber Sunset Pavilion Soirée
                  </h3>
                  <p className="text-xs text-[#FAF7F0]/85 mt-0.5">
                    140 guests · Heritage Courtyard · ₹8.5L Planned
                  </p>
                </div>
              </div>

              {/* Compact Stats Strip */}
              <div className="p-3.5 bg-white grid grid-cols-3 gap-2 text-center text-xs border-t border-[#E8E1D5]">
                <div className="flex flex-col">
                  <span className="font-serif text-sm font-bold text-[#392538]">₹8.5L</span>
                  <span className="text-[10px] text-[#4C454A] uppercase tracking-wider">Optimized Cost</span>
                </div>
                <div className="flex flex-col border-x border-[#E8E1D5]">
                  <span className="font-serif text-sm font-bold text-[#755a2a]">32 Tasks</span>
                  <span className="text-[10px] text-[#4C454A] uppercase tracking-wider">Timeline Set</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-sm font-bold text-[#C97862]">Ready</span>
                  <span className="text-[10px] text-[#4C454A] uppercase tracking-wider">Mood Palette</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
           SECTION B: QUICK EVENT CREATION PANEL
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-10 bg-[#F4EFE6]/50 border-y border-[#E8E1D5]" id="quick-plan">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="font-sans text-xs uppercase tracking-widest text-[#755a2a] font-bold">Express Dossier</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#392538] font-medium tracking-tight mt-1">
              Create your celebration in minutes
            </h2>
          </div>

          <form onSubmit={handleQuickCreate} className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E8E1D5] shadow-xs">
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1: Event Type & Logistics */}
              <div className="flex flex-col gap-4">
                {/* Event Type Pills */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#755a2a] mb-2">
                    1. Select Celebration Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {celebrationCategories.map(cat => {
                      const isSelected = selectedType === cat.type;
                      return (
                        <button
                          key={cat.type}
                          type="button"
                          onClick={() => setSelectedType(cat.type)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#392538] text-[#FAF7F0] border border-[#392538] shadow-xs'
                              : 'bg-[#F4EFE6] text-[#4C454A] hover:text-[#392538] border border-transparent'
                          }`}
                        >
                          <span className="mr-1">{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4C454A] mb-1">Target Date</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-base text-[#755a2a]">
                        calendar_today
                      </span>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={e => setEventDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-lg bg-[#F4EFE6] border-0 focus:ring-1 focus:ring-[#C5A46D] text-[#392538]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4C454A] mb-1">City or Venue</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-base text-[#755a2a]">
                        location_on
                      </span>
                      <input
                        type="text"
                        value={cityLocation}
                        onChange={e => setCityLocation(e.target.value)}
                        placeholder="e.g. Jaipur, Ahmedabad, Delhi"
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-lg bg-[#F4EFE6] border-0 focus:ring-1 focus:ring-[#C5A46D] text-[#392538]"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Budget, Scale & Submit */}
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#755a2a] mb-2">
                    2. Scale & Budget Parameters
                  </label>

                  {/* Guest Scale Slider */}
                  <div className="bg-[#F4EFE6] p-3 rounded-xl mb-3">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-[#1C1C18]">Guest Scale</span>
                      <span className="font-serif font-bold text-[#392538] text-sm">
                        {guestScale} Guests
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="600"
                      step="10"
                      value={guestScale}
                      onChange={e => setGuestScale(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-[#E8E1D5] rounded-lg appearance-none cursor-pointer accent-[#392538]"
                    />
                    <div className="flex justify-between text-[10px] text-[#4C454A] mt-1">
                      <span>Intimate (10)</span>
                      <span>Boutique (150)</span>
                      <span>Grand (600+)</span>
                    </div>
                  </div>

                  {/* Estimated Budget & Atmosphere */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4C454A] mb-1">
                        Estimated Budget (INR)
                      </label>
                      <input
                        type="number"
                        min="10000"
                        step="10000"
                        value={budgetVal}
                        onChange={e => setBudgetVal(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[#F4EFE6] border-0 focus:ring-1 focus:ring-[#C5A46D] text-[#392538]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#4C454A] mb-1">
                        Atmosphere Style
                      </label>
                      <select
                        value={atmosphere}
                        onChange={e => setAtmosphere(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-[#F4EFE6] border-0 focus:ring-1 focus:ring-[#C5A46D] text-[#392538]"
                      >
                        <option value="Heritage & Regal">Heritage & Regal</option>
                        <option value="Modern Minimalist">Modern Minimalist</option>
                        <option value="Rustic Tuscan Garden">Rustic Tuscan Garden</option>
                        <option value="Vibrant Bohemian">Vibrant Bohemian</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#392538] text-[#FAF7F0] hover:bg-[#231123] font-sans text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-[#C5A46D]"
                >
                  <span className="material-symbols-outlined text-[#C5A46D] text-base">
                    {isSubmitting ? 'sync' : 'auto_awesome'}
                  </span>
                  <span>
                    {isSubmitting
                      ? 'Structuring Celebration Blueprint...'
                      : 'Create My Plan with Utsav AI'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* =========================================================================
           SECTION C: FEATURED CELEBRATIONS
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-12 bg-[#FAF7F0]" id="featured-events">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-[#755a2a] font-bold">
                Curated Archetypes
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#392538] font-medium tracking-tight mt-1">
                Featured Celebrations
              </h2>
            </div>
            <a
              href="#quick-plan"
              className="text-xs font-semibold text-[#755a2a] hover:text-[#392538] inline-flex items-center gap-1 transition"
            >
              <span>Custom Blueprint</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Wedding */}
            <article className="group rounded-2xl overflow-hidden bg-white border border-[#E8E1D5] hover:shadow-md transition flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <img
                  alt="Regal palace wedding courtyard setup with glowing lamps"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsf9_GirCBCaElQba1Z3y6YPwJfaCcP3hsvcxDL-q5O78RZ2fMm14_RcpvoWV28vi49QRLDEn_tCubxaLrEErRKDzT8N5VpjU2Ec5K1XKzUUjXgMCOFGnYc20teG5JChtvoj_pWCBkx8I8iFTpKlj3-M04uGL17ufWvdrtQB-_sayNCikFiRepnTu4TbjpXCMNWnipYoZ6uiAna7efxUjgsolUaMOmvhBS3pt-hhNCHtZ7CciI7Gm8lg"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#392538]/90 text-[#FAF7F0] text-[10px] font-semibold tracking-wide uppercase">
                  Weddings
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#392538] group-hover:text-[#755a2a] transition-colors">
                    Palace & Destination Weddings
                  </h3>
                  <p className="font-sans text-xs text-[#4C454A] mt-1 line-clamp-2">
                    Multi-day itineraries, traditional rituals, acoustic mandaps, and bespoke hospitality dossiers.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E8E1D5] flex items-center justify-between text-xs font-semibold text-[#755a2a]">
                  <span>100 – 400 Guests</span>
                  <button
                    onClick={() =>
                      handleTemplateSelect(
                        'Wedding',
                        'Royal Haveli Mandap Celebration',
                        1200000,
                        200,
                        'Udaipur, Rajasthan'
                      )
                    }
                    className="hover:text-[#392538] inline-flex items-center gap-0.5"
                  >
                    Plan →
                  </button>
                </div>
              </div>
            </article>

            {/* Birthdays */}
            <article className="group rounded-2xl overflow-hidden bg-white border border-[#E8E1D5] hover:shadow-md transition flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <img
                  alt="Sun-drenched rooftop terrace birthday celebration setup"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsbrjjAiDMHcnx4IkprCYxyJ1RfOyHTfbB5E4A91Xf4wjWukjj3-ZvBx9OE5gezJnwXj9gfJqPE--kmLc472v4JsKuDO0nP2VlP_54AZ-VE864Dsssl9qKRhnWQFzprgcv3Tg4acoSAfuekkzZ8oTf_JEMXSawSRsCnSG4-hybMO587JruEZ5oG-sN3kUwJIx7mEXZx5irrBxS6BDNAODj5hng8UhyDXhwLSIDycEOozjR33ZNwGg8NA"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#C97862]/90 text-[#FAF7F0] text-[10px] font-semibold tracking-wide uppercase">
                  Birthdays
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#392538] group-hover:text-[#755a2a] transition-colors">
                    Milestone Birthdays
                  </h3>
                  <p className="font-sans text-xs text-[#4C454A] mt-1 line-clamp-2">
                    Intimate 30th, 40th & 50th evenings, artisanal cocktail curations, live acoustic sets, and memories.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E8E1D5] flex items-center justify-between text-xs font-semibold text-[#755a2a]">
                  <span>25 – 80 Guests</span>
                  <button
                    onClick={() =>
                      handleTemplateSelect(
                        'Milestone Birthday',
                        'Aarav’s 40th Lake Pichola Evening',
                        350000,
                        45,
                        'Udaipur, Rajasthan'
                      )
                    }
                    className="hover:text-[#392538] inline-flex items-center gap-0.5"
                  >
                    Plan →
                  </button>
                </div>
              </div>
            </article>

            {/* Festivals */}
            <article className="group rounded-2xl overflow-hidden bg-white border border-[#E8E1D5] hover:shadow-md transition flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <img
                  alt="Festive decor with fragrant yellow marigolds and brass vessels"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0WHcqfREpMbgsgzV4Tx_H_Uhd8Psm3FPYTlhUx3wHT1Dvl5gaSygYAPniO8IES6DlM0gfynR0XENtFE6STWho2NnNsfrzcTJPWxDbxYEeHPT5w5wAjTVRcEPmPWdSGzkgdmUf6FCQKZ4gSXUFlME_wP2H3zroKz_iuI7ST4zyqeRpYGsg2Fyaddk76ov4OVMexgrILm_565IOhH0Qnj-vqayq7vQ8Mp6gXVMVPkjRLyTq5gFyt7-zjA"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-amber-600/90 text-[#FAF7F0] text-[10px] font-semibold tracking-wide uppercase">
                  Festivals
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#392538] group-hover:text-[#755a2a] transition-colors">
                    Festivals & Cultural Pujas
                  </h3>
                  <p className="font-sans text-xs text-[#4C454A] mt-1 line-clamp-2">
                    Diwali galas, family satyanarayan pujas, heirloom brass accents, and authentic catering spreads.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E8E1D5] flex items-center justify-between text-xs font-semibold text-[#755a2a]">
                  <span>50 – 200 Guests</span>
                  <button
                    onClick={() =>
                      handleTemplateSelect(
                        'Festival',
                        'Deepavali Heritage Family Soirée',
                        450000,
                        100,
                        'New Delhi'
                      )
                    }
                    className="hover:text-[#392538] inline-flex items-center gap-0.5"
                  >
                    Plan →
                  </button>
                </div>
              </div>
            </article>

            {/* Corporate */}
            <article className="group rounded-2xl overflow-hidden bg-white border border-[#E8E1D5] hover:shadow-md transition flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <img
                  alt="Black-tie corporate gala champagne coupe banquet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBonQ6IcVtat2UkzJdh-83o3_nCnRtXC7b0XB2ZcP5CVVsnXvmeM-nhCmYeWhBxNRHeVxcJUur1eBMj288ISWm9W-xM3LAJVC616MaoIJcWbrCveCQyC8URhTYO3V_12SQimZiRCfDnv6XHuTrf8X4SOZKoS4TWx2O16Zsgq0Gl8G4jHhhlSIWfD29nY_ncdtgOqsc1LBFIagIaf_K6SxP003C5za2WXCCTF8lWpwvN2oRRGkNlpC0GwQ"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#231123]/90 text-[#FAF7F0] text-[10px] font-semibold tracking-wide uppercase">
                  Corporate
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#392538] group-hover:text-[#755a2a] transition-colors">
                    Corporate Galas & Retreats
                  </h3>
                  <p className="font-sans text-xs text-[#4C454A] mt-1 line-clamp-2">
                    Annual award nights, executive banquets, AV scheduling, speaker runs, and signature dining.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E8E1D5] flex items-center justify-between text-xs font-semibold text-[#755a2a]">
                  <span>80 – 350 Guests</span>
                  <button
                    onClick={() =>
                      handleTemplateSelect(
                        'Corporate Gala',
                        'Annual Leadership Banquet & Awards',
                        800000,
                        150,
                        'Bengaluru, Karnataka'
                      )
                    }
                    className="hover:text-[#392538] inline-flex items-center gap-0.5"
                  >
                    Plan →
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================================
           SECTION D: HOW UTSAV AI WORKS (3-STEP METHODOLOGY)
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-12 bg-[#F4EFE6]/40 border-t border-[#E8E1D5]" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-9">
            <span className="font-sans text-xs uppercase tracking-widest text-[#755a2a] font-bold">The Methodology</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#392538] font-medium tracking-tight mt-1">
              How Utsav AI Works
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#4C454A] mt-1">
              From raw inspiration to smooth day-of execution in three graceful steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#392538]/10 text-[#392538] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">edit_note</span>
                </div>
                <span className="font-serif text-3xl font-bold text-[#E8E1D5] select-none">01</span>
              </div>
              <h3 className="font-serif text-base font-semibold text-[#392538]">Share your celebration idea</h3>
              <p className="font-sans text-xs text-[#4C454A] leading-relaxed">
                Type, speak, or select your preferences. Describe the guest vibe, must-have customs, dietary needs, or visual aspirations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#C5A46D]/40 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#C5A46D]/20 text-[#755a2a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">psychology</span>
                </div>
                <span className="font-serif text-3xl font-bold text-[#C5A46D]/30 select-none">02</span>
              </div>
              <h3 className="font-serif text-base font-semibold text-[#392538]">Let AI organize your event plan</h3>
              <p className="font-sans text-xs text-[#4C454A] leading-relaxed">
                In seconds, our models compile structured cost breakdowns in INR, curated decor palettes, vendor briefs, and milestone checklists.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#C97862]/15 text-[#C97862] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">celebration</span>
                </div>
                <span className="font-serif text-3xl font-bold text-[#E8E1D5] select-none">03</span>
              </div>
              <h3 className="font-serif text-base font-semibold text-[#392538]">Customize details and celebrate</h3>
              <p className="font-sans text-xs text-[#4C454A] leading-relaxed">
                Fine-tune line items, share PDF blueprints with family, track RSVPs via WhatsApp, and step into your event without logistical anxiety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
           SECTION E: AI PLANNING BENEFITS (6-ITEM COMPACT GRID)
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-12 bg-[#FAF7F0]" id="benefits">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-8">
            <span className="font-sans text-xs uppercase tracking-widest text-[#755a2a] font-bold">
              Comprehensive Capabilities
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#392538] font-medium tracking-tight mt-1">
              AI Planning Benefits
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#4C454A] mt-1">
              Everything an experienced planner provides, supercharged for clarity and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#E8E1D5] flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white text-[#392538] shadow-xs flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base text-[#755a2a]">account_balance_wallet</span>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#392538]">Smart budget planning</h3>
                <p className="font-sans text-xs text-[#4C454A] mt-0.5 leading-snug">
                  Dynamic rupee allocation matrix preventing unexpected vendor creep and protecting buffers.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#E8E1D5] flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white text-[#392538] shadow-xs flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base text-[#755a2a]">view_timeline</span>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#392538]">Personalized timelines</h3>
                <p className="font-sans text-xs text-[#4C454A] mt-0.5 leading-snug">
                  Minute-by-minute day-of schedules with reverse-engineered deadlines for rehearsals and decor setup.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#E8E1D5] flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white text-[#392538] shadow-xs flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base text-[#755a2a]">storefront</span>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#392538]">Venue & vendor discovery</h3>
                <p className="font-sans text-xs text-[#4C454A] mt-0.5 leading-snug">
                  Instantly structure requirements for verified caterers, decorators, mehendi artists, and musicians.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#E8E1D5] flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white text-[#392538] shadow-xs flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base text-[#755a2a]">groups</span>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#392538]">Guest planning</h3>
                <p className="font-sans text-xs text-[#4C454A] mt-0.5 leading-snug">
                  Effortless RSVP tracking, dietary requirement sorting, and family party choreography.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#E8E1D5] flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white text-[#392538] shadow-xs flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base text-[#755a2a]">palette</span>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#392538]">Moodboard creation</h3>
                <p className="font-sans text-xs text-[#4C454A] mt-0.5 leading-snug">
                  Harmonious color schemes (#392538, #C5A46D, #C97862), floral palettes, and printable decor guides.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#E8E1D5] flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white text-[#392538] shadow-xs flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base text-[#755a2a]">auto_awesome</span>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#392538]">AI recommendations</h3>
                <p className="font-sans text-xs text-[#4C454A] mt-0.5 leading-snug">
                  Proactive ideas for authentic regional touches, weather contingency tips, and guest gift concepts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
           TANGIBLE CASE STUDY: INSIDE AN INTELLIGENT BLUEPRINT
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-10 bg-[#F4EFE6]/30 border-y border-[#E8E1D5]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="font-sans text-xs uppercase tracking-widest text-[#755a2a] font-bold">
              Tangible Intelligence
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#392538] font-medium tracking-tight mt-1">
              Inside an Intelligent Blueprint
            </h2>
            <p className="font-sans text-xs text-[#4C454A] mt-1">
              See how Utsav AI turns a brief into an exhaustive, publication-grade celebration dossier.
            </p>
          </div>

          <div className="p-5 sm:p-7 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8E1D5] gap-2">
              <div>
                <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
                  Case Study Dossier · Gujarat
                </span>
                <h3 className="font-serif text-xl font-bold text-[#392538]">A Garden Wedding to Remember</h3>
                <p className="text-xs text-[#4C454A]">120 guests · Heritage Courtyard, Ahmedabad · Target Budget ₹6,00,000</p>
              </div>
              <button
                onClick={() => onNavigate('overview')}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-[#392538] text-white text-xs font-semibold hover:bg-[#231123] transition-colors"
              >
                Inspect Live Dossier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 01 Chromatic Signature */}
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5] flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
                  01 · Chromatic Signature
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#C5A46D] shadow-xs" title="Champagne Marigold" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-[#392538] block">Champagne Marigold</span>
                    <span className="text-[#4C454A]">Primary floral & brass</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#392538] shadow-xs" title="Deep Plum" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-[#392538] block">Deep Plum Mulberry</span>
                    <span className="text-[#4C454A]">Stationery & velvet runners</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#C97862] shadow-xs" title="Warm Terracotta" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-[#392538] block">Warm Terracotta</span>
                    <span className="text-[#4C454A]">Ceramic vessels & lanterns</span>
                  </div>
                </div>
              </div>

              {/* 02 Resource Allocation */}
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5] flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
                  02 · Resource Allocation (₹6,00,000)
                </span>
                <div className="flex justify-between text-xs font-medium">
                  <span>Catering (Kathiyawadi)</span>
                  <span className="font-bold text-[#392538]">₹2,28,000 (38%)</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span>Heritage Venue Courtyard</span>
                  <span className="font-bold text-[#392538]">₹1,92,000 (32%)</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span>Decor & Brass Florals</span>
                  <span className="font-bold text-[#392538]">₹1,08,000 (18%)</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span>Editorial Photography</span>
                  <span className="font-bold text-[#392538]">₹72,000 (12%)</span>
                </div>
                <div className="mt-1 pt-1.5 border-t border-[#E8E1D5] text-[11px] text-[#755a2a] font-semibold">
                  Contingency reserve: ₹30,000 buffer locked
                </div>
              </div>

              {/* 03 Milestone Checkpoints */}
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5] flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
                  03 · Next Execution Milestones
                </span>
                <div className="text-xs">
                  <span className="font-bold text-[#392538] block">Tasting Menu Lock</span>
                  <span className="text-[#4C454A]">Chef demo for 12 specialty farsan items. Due in 4 days.</span>
                </div>
                <div className="text-xs pt-1 border-t border-[#E8E1D5]">
                  <span className="font-bold text-[#392538] block">Digital RSVP Rollout</span>
                  <span className="text-[#4C454A]">WhatsApp invitations via Utsav Concierge.</span>
                </div>
                <div className="text-xs pt-1 border-t border-[#E8E1D5]">
                  <span className="font-bold text-[#392538] block">Acoustic Trio Briefing</span>
                  <span className="text-[#4C454A]">Curated 4-hour morning phera instrumental set.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
           EDITORIAL FIELD GUIDES (6 GUIDES GRID)
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-12 bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-[#755a2a] font-bold">
                The Luxury Archive
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#392538] font-medium tracking-tight mt-1">
                Editorial Field Guides
              </h2>
              <p className="font-sans text-xs text-[#4C454A] mt-1">
                Expertise gathered from our network of international creative directors and master planners.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {editorialFieldGuides.map(guide => (
              <article
                key={guide.id}
                onClick={() => onOpenGuidesModal(guide.id)}
                className="group p-5 rounded-2xl bg-white border border-[#E8E1D5] hover:border-[#C5A46D] hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#755a2a]">
                    <span className="uppercase tracking-wider">{guide.category}</span>
                    <span className="text-[#4C454A]/70">{guide.readTime}</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#392538] group-hover:text-[#755a2a] transition-colors leading-snug">
                    {guide.title}
                  </h3>
                  <p className="font-sans text-xs text-[#4C454A] line-clamp-2 leading-relaxed">
                    {guide.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8E1D5] flex items-center justify-between text-xs font-semibold text-[#755a2a]">
                  <span>Read Guide</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
           SECTION F: FINAL CALL TO ACTION (DEEP PLUM BANNER)
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-10 bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto rounded-3xl bg-[#392538] text-[#FAF7F0] p-8 sm:p-12 relative overflow-hidden text-center flex flex-col items-center gap-4 shadow-xl">
          {/* Gold Shimmer Background Elements */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#C5A46D]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#C97862]/25 blur-3xl pointer-events-none" />

          <span className="px-3.5 py-1 rounded-full bg-white/10 text-[#C5A46D] text-xs uppercase tracking-widest font-semibold border border-[#C5A46D]/20">
            Start Without Friction
          </span>

          <h2 className="font-serif text-2xl sm:text-4xl text-[#FAF7F0] font-medium tracking-tight max-w-2xl leading-snug">
            Your celebration deserves <br className="hidden sm:inline" />
            <span className="italic text-[#C5A46D]">something extraordinary.</span>
          </h2>

          <p className="font-sans text-xs sm:text-sm text-[#FAF7F0]/80 max-w-lg leading-relaxed">
            Join thousands of hosts who planned memorable weddings, birthdays, and soirées with complete peace of mind.
          </p>

          <div className="pt-2 z-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('quick-plan');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('overview');
              }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#C5A46D] text-[#252321] font-sans text-sm font-bold tracking-wide hover:bg-[#C5A46D]/90 shadow-md transition-all"
            >
              <span>Start Planning with Utsav AI</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <button
              onClick={() => onNavigate('overview')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-[#FAF7F0] font-sans text-sm font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              <span>Open Command Center</span>
            </button>
          </div>

          <span className="text-[11px] text-[#FAF7F0]/60 mt-1">
            No credit card required · Instant custom celebration blueprint
          </span>
        </div>
      </section>
    </div>
  );
};
