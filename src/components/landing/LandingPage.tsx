import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { EventType, ActiveTab } from '../../types';

interface LandingPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenGuidesModal?: (guideId?: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const { createEvent, formatCurrency } = useEvents();

  // Quick Event Creation Form State (Step 1)
  const [celebrationType, setCelebrationType] = useState<EventType>('Wedding');
  const [eventDate, setEventDate] = useState<string>('2025-11-20');
  const [city, setCity] = useState<string>('Jaipur');
  const [budget, setBudget] = useState<number>(600000);
  const [formError, setFormError] = useState<string>('');

  // Step 2 Modal state (Ask for guest count and other details in the next step)
  const [showStep2, setShowStep2] = useState<boolean>(false);
  const [guestCount, setGuestCount] = useState<number>(150);
  const [eventTitle, setEventTitle] = useState<string>('');

  // 4 Popular Event Types
  const popularEvents = [
    {
      title: 'Wedding',
      type: 'Wedding' as EventType,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      actionLabel: 'Plan a Wedding',
    },
    {
      title: 'Birthday',
      type: 'Milestone Birthday' as EventType,
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
      actionLabel: 'Plan a Birthday',
    },
    {
      title: 'Festival',
      type: 'Festival' as EventType,
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      actionLabel: 'Plan a Festival',
    },
    {
      title: 'Other Events',
      type: 'Corporate Gala' as EventType,
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80',
      actionLabel: 'Plan an Event',
    },
  ];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!city.trim()) {
      setFormError('Please enter a city.');
      return;
    }
    if (!eventDate) {
      setFormError('Please select a date.');
      return;
    }
    if (budget < 5000) {
      setFormError('Please enter a valid budget.');
      return;
    }

    // Default title for step 2
    setEventTitle(`${city.trim()} ${celebrationType}`);
    setShowStep2(true);
  };

  const handleFinishPlan = (guestsToSave?: number) => {
    const finalGuests = guestsToSave !== undefined ? guestsToSave : guestCount;
    const finalTitle = eventTitle.trim() || `${city.trim()} ${celebrationType}`;

    const newId = createEvent({
      name: finalTitle,
      title: finalTitle,
      type: celebrationType,
      eventType: celebrationType,
      date: eventDate,
      location: city.trim(),
      city: city.trim(),
      guestCount: finalGuests || 100,
      budget: budget || 500000,
      totalBudget: budget || 500000,
      theme: 'Classic Celebration',
      description: `Planned with Utsav AI for ${finalGuests || 100} guests in ${city.trim()}.`,
      status: 'Planning',
    });

    setShowStep2(false);
    onShowToast(`Plan created for ${finalTitle}!`, 'success');
    onNavigate('overview');
  };

  const handleSelectPopularType = (type: EventType) => {
    setCelebrationType(type);
    const quickPlanEl = document.getElementById('quick-plan');
    if (quickPlanEl) {
      quickPlanEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#FAF7F0]">
      {/* =========================================================================
           B. WELCOME SECTION (Hero with existing celebration aesthetic)
      ========================================================================= */}
      <section className="relative w-full px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16 overflow-hidden bg-gradient-to-b from-[#FAF7F0] via-[#FAF7F0] to-[#F4EFE6]/50">
        {/* Subtle decorative glowing background accents */}
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#C5A46D]/10 blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-[#C97862]/10 blur-3xl pointer-events-none -z-0" />

        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-4 relative z-10">
          {/* Subtle Celebration Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFE6] border border-[#E8E1D5] text-[#755a2a] text-xs font-semibold shadow-2xs">
            <span className="material-symbols-outlined text-sm text-[#C5A46D]">celebration</span>
            <span>Utsav AI Celebration Planner</span>
          </div>

          {/* Exact Required Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#392538] font-medium tracking-tight leading-tight max-w-2xl">
            Plan your perfect celebration, the easy way.
          </h1>

          {/* Exact Required Description */}
          <p className="font-sans text-sm sm:text-base text-[#4C454A] max-w-xl leading-relaxed">
            Tell us what you're celebrating. We'll help you plan your event, manage your budget, and organize every detail.
          </p>

          {/* Exact Required Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#quick-plan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#392538] text-[#FAF7F0] text-sm font-semibold hover:bg-[#231123] shadow-xs transition-colors"
            >
              <span>Start Planning</span>
              <span className="material-symbols-outlined text-base text-[#C5A46D]">arrow_forward</span>
            </a>
            <a
              href="#popular-events"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#392538] text-sm font-semibold hover:bg-[#F4EFE6] border border-[#E8E1D5] shadow-2xs transition-colors"
            >
              <span>Explore Events</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
           C. QUICK EVENT CREATION (Small, clean card with 4 fields)
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-10 bg-[#FAF7F0]" id="quick-plan">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E1D5] shadow-xs">
            <div className="text-center mb-6">
              <h2 className="font-serif text-xl sm:text-2xl text-[#392538] font-semibold">
                Quick Event Plan
              </h2>
              <p className="text-xs text-[#4C454A] mt-1">
                Enter your basic event details to get started.
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. What are you celebrating? */}
                <div>
                  <label className="block text-xs font-semibold text-[#392538] mb-1.5">
                    What are you celebrating?
                  </label>
                  <select
                    value={celebrationType}
                    onChange={(e) => setCelebrationType(e.target.value as EventType)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl text-[#392538] font-medium focus:outline-none focus:border-[#392538]"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Milestone Birthday">Birthday</option>
                    <option value="Festival">Festival</option>
                    <option value="Corporate Gala">Corporate Event</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Other">Other Events</option>
                  </select>
                </div>

                {/* 2. Event Date */}
                <div>
                  <label className="block text-xs font-semibold text-[#392538] mb-1.5">
                    Event date
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl text-[#392538] focus:outline-none focus:border-[#392538]"
                  >
                  </input>
                </div>

                {/* 3. City */}
                <div>
                  <label className="block text-xs font-semibold text-[#392538] mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, Jaipur, Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl text-[#392538] placeholder:text-[#4C454A]/50 focus:outline-none focus:border-[#392538]"
                  />
                </div>

                {/* 4. Budget */}
                <div>
                  <label className="block text-xs font-semibold text-[#392538] mb-1.5">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={5000}
                    step={10000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl text-[#392538] focus:outline-none focus:border-[#392538]"
                  />
                </div>
              </div>

              {/* Button: Create My Plan */}
              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-[#392538] hover:bg-[#231123] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Create My Plan</span>
                <span className="material-symbols-outlined text-sm text-[#C5A46D]">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* =========================================================================
           D. POPULAR EVENT TYPES (Exactly 4 compact cards + View All link)
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-12 bg-[#F4EFE6]/40 border-t border-[#E8E1D5]" id="popular-events">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <h2 className="font-serif text-2xl text-[#392538] font-semibold">
                Popular Event Types
              </h2>
              <p className="text-xs text-[#4C454A] mt-0.5">
                Choose a celebration to start planning.
              </p>
            </div>

            <button
              onClick={() => onNavigate('events')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#755a2a] hover:text-[#392538] transition-colors self-start sm:self-auto"
            >
              <span>View All Events</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* 4 Compact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularEvents.map((evt, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E8E1D5] shadow-2xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative h-40 w-full overflow-hidden bg-[#FAF7F0]">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <h3 className="font-serif text-base font-semibold text-[#392538]">
                    {evt.title}
                  </h3>

                  <button
                    onClick={() => handleSelectPopularType(evt.type)}
                    className="w-full py-2 px-3 rounded-xl bg-[#F4EFE6] hover:bg-[#392538] text-[#392538] hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{evt.actionLabel}</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
           E. HOW IT WORKS (Only 3 short steps, no long explanations)
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-12 bg-[#FAF7F0] border-t border-[#E8E1D5]" id="how-it-works">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-2xl text-[#392538] font-semibold mb-8">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-[#392538] text-[#FAF7F0] font-serif font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-serif text-base font-semibold text-[#392538]">
                Tell us about your event.
              </h3>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C5A46D] text-white font-serif font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-serif text-base font-semibold text-[#392538]">
                Get your event plan.
              </h3>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-[#755a2a] text-white font-serif font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-serif text-base font-semibold text-[#392538]">
                Organize everything in one place.
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
           F. FINAL CALL TO ACTION (Short and clean)
      ========================================================================= */}
      <section className="w-full px-4 sm:px-6 py-12 bg-[#F4EFE6] border-t border-[#E8E1D5] text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#392538] font-semibold">
            Ready to plan something special?
          </h2>

          <a
            href="#quick-plan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#392538] hover:bg-[#231123] text-white text-sm font-semibold transition-colors shadow-xs"
          >
            <span>Start Planning</span>
            <span className="material-symbols-outlined text-base text-[#C5A46D]">arrow_forward</span>
          </a>
        </div>
      </section>

      {/* =========================================================================
           STEP 2 MODAL (Asked after Step 1 so initial card is clean and simple)
      ========================================================================= */}
      {showStep2 && (
        <div className="fixed inset-0 z-50 bg-[#392538]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E8E1D5] relative animate-in fade-in duration-150">
            <button
              onClick={() => setShowStep2(false)}
              className="absolute top-4 right-4 text-[#4C454A] hover:text-[#392538]"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
                Step 2 of 2
              </span>
              <h3 className="font-serif text-xl font-bold text-[#392538] mt-0.5">
                Almost there! A few details
              </h3>
              <p className="text-xs text-[#4C454A] mt-1">
                For your {celebrationType} in {city} on {eventDate}.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#392538] mb-1">
                  Celebration Name
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Sharma Family Wedding"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl text-[#392538] focus:outline-none focus:border-[#392538]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#392538] mb-1">
                  Estimated Guest Count
                </label>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl text-[#392538] focus:outline-none focus:border-[#392538]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F4EFE6] text-xs text-[#4C454A] flex items-center justify-between">
                <span>Selected Budget:</span>
                <span className="font-semibold text-[#392538]">{formatCurrency(budget)}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleFinishPlan()}
                  className="flex-1 py-2.5 px-4 bg-[#392538] hover:bg-[#231123] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                >
                  Create Plan & Open Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => handleFinishPlan(100)}
                  className="py-2.5 px-3 rounded-xl bg-[#FAF7F0] hover:bg-[#ECE6DA] text-[#4C454A] text-xs font-medium border border-[#E8E1D5]"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
