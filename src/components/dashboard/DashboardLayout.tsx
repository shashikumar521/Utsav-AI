import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { Logo } from '../common/Logo';
import { 
  LayoutDashboard, Calendar, DollarSign, CheckSquare, Palette, 
  Users, Bot, Settings, Plus, ChevronDown, ArrowLeft, Menu, X, 
  Sparkles, Clock, Globe, MapPin
} from 'lucide-react';

import { OverviewView } from './OverviewView';
import { EventsView } from './EventsView';
import { BudgetView } from './BudgetView';
import { VenueDiscoveryView } from './VenueDiscoveryView';
import { TimelineView } from './TimelineView';
import { MoodboardView } from './MoodboardView';
import { GuestsVendorsView } from './GuestsVendorsView';
import { AIAssistantView } from './AIAssistantView';
import { SettingsView } from './SettingsView';
import { NewEventModal } from './NewEventModal';

interface DashboardLayoutProps {
  onBackToHome: () => void;
  onOpenFieldGuide: (guideId: string) => void;
  onReopenWelcome?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onBackToHome, onOpenFieldGuide, onReopenWelcome }) => {
  const { 
    currentEvent, 
    events, 
    setCurrentEventId, 
    activeTab, 
    setActiveTab,
    daysRemaining,
    currency,
    setCurrency,
    showToast,
  } = useEvents();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isEventSwitcherOpen, setIsEventSwitcherOpen] = useState(false);

  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'events' as const, label: 'My Events', icon: Calendar, badge: events.length },
    { id: 'budget' as const, label: 'Budget & Estimator', icon: DollarSign },
    { id: 'venues' as const, label: 'Discover Venues', icon: MapPin },
    { id: 'timeline' as const, label: 'Tasks & Timeline', icon: CheckSquare },
    { id: 'moodboard' as const, label: 'Moodboard', icon: Palette },
    { id: 'guests-vendors' as const, label: 'Guests & Vendors', icon: Users },
    { id: 'ai-assistant' as const, label: 'AI Planner', icon: Bot, isAi: true },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-ivory-warm flex flex-col">
      {/* ================= TOP COMMAND BAR ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-plum/10 shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Brand & Back to Home */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 text-plum/70 hover:text-plum rounded-lg hover:bg-ivory-warm"
              aria-label="Toggle Navigation"
            >
              {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <button
              onClick={onBackToHome}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-plum/70 hover:text-plum px-2.5 py-1.5 rounded-lg hover:bg-ivory-warm transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </button>

            <div className="h-5 w-px bg-plum/10 hidden sm:block" />

            {/* Active Event Dropdown Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsEventSwitcherOpen(!isEventSwitcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-plum/15 hover:border-plum/30 bg-ivory-warm/40 hover:bg-ivory-warm transition-all text-left"
              >
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse shrink-0" />
                <div className="max-w-[140px] sm:max-w-[220px] truncate">
                  <div className="text-xs font-serif font-bold text-plum truncate">
                    {currentEvent?.title || 'Select Celebration'}
                  </div>
                  <div className="text-[10px] text-plum/60 truncate">
                    {currentEvent?.city} · {new Date(currentEvent?.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <ChevronDown size={14} className="text-plum/50 shrink-0 ml-1" />
              </button>

              {/* Dropdown Menu */}
              {isEventSwitcherOpen && (
                <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-plum/15 py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-plum/40 uppercase tracking-wider border-b border-plum/5">
                    Your Celebrations
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-plum/5">
                    {events.map((evt) => (
                      <button
                        key={evt.id}
                        onClick={() => {
                          setCurrentEventId(evt.id);
                          setIsEventSwitcherOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-ivory-warm/60 transition-colors ${
                          evt.id === currentEvent?.id ? 'bg-plum/5 font-semibold' : ''
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-plum/40 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-plum truncate font-medium">{evt.title}</p>
                          <p className="text-[10px] text-plum/50 truncate">
                            {evt.eventType} · {evt.city}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-plum/10">
                    <button
                      onClick={() => {
                        setIsEventSwitcherOpen(false);
                        setIsNewEventModalOpen(true);
                      }}
                      className="w-full py-1.5 px-2 bg-plum text-ivory-warm rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-plum-light transition-all"
                    >
                      <Plus size={13} />
                      New Celebration
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Countdown, Currency Pill, + New Event Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Countdown Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-semibold">
              <Clock size={13} />
              <span>{daysRemaining > 0 ? `${daysRemaining} Days to Ceremony` : 'Ceremony Today!'}</span>
            </div>

            {/* Currency Selector Quick Toggle */}
            <div className="hidden sm:flex items-center text-xs font-medium text-plum/70 bg-ivory-warm/60 border border-plum/10 rounded-lg px-2 py-1">
              <Globe size={13} className="mr-1 text-plum/50" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-plum focus:outline-none cursor-pointer"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED</option>
              </select>
            </div>

            {/* Replay Intro Action */}
            {onReopenWelcome && (
              <button
                onClick={onReopenWelcome}
                className="px-2.5 py-1.5 rounded-lg text-plum/70 hover:text-plum hover:bg-ivory-warm transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                title="Replay celebration welcome intro"
                aria-label="Replay Intro"
              >
                <Sparkles size={14} className="text-gold" />
                <span className="hidden sm:inline">Intro</span>
              </button>
            )}

            {/* Quick Action Button */}
            <button
              onClick={() => setIsNewEventModalOpen(true)}
              className="px-3.5 py-1.5 bg-plum text-ivory-warm text-xs font-semibold rounded-lg hover:bg-plum-light transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Event</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN WORKSPACE BODY ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-plum/10 py-6 px-4 space-y-6 shrink-0 justify-between">
          <div className="space-y-6">
            {/* Brand Logo in sidebar */}
            <div className="px-2">
              <Logo size="sm" />
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-plum text-ivory-warm shadow-xs'
                        : 'text-plum/70 hover:bg-ivory-warm hover:text-plum'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-gold' : item.isAi ? 'text-gold' : 'text-plum/50'} />
                      <span>{item.label}</span>
                    </div>

                    {item.isAi && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-gold/20 text-gold-dark font-bold border border-gold/40">
                        AI
                      </span>
                    )}
                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-plum/10 text-plum'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Luxury Field Guide Quick Callout */}
          <div className="p-3.5 rounded-xl bg-ivory-warm border border-plum/10 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta block">
              Editorial Field Guides
            </span>
            <p className="text-xs font-serif text-plum font-semibold mt-1">
              Curated Celebration Protocols
            </p>
            <p className="text-[11px] text-plum/60 mt-0.5">
              Access 6 luxury guides on Sangeet flows, royal banquet dining, and mandap architecture.
            </p>
            <button
              onClick={() => onOpenFieldGuide('royal-wedding')}
              className="mt-2.5 text-[11px] font-semibold text-plum hover:text-terracotta underline decoration-plum/30 transition-colors block"
            >
              Browse Archives →
            </button>
          </div>
        </aside>

        {/* MOBILE SIDEBAR MODAL */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-plum/40 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-full bg-white h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-plum/10">
                  <Logo size="sm" />
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1 text-plum/50 hover:text-plum rounded"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-plum text-ivory-warm shadow-xs'
                            : 'text-plum/70 hover:bg-ivory-warm hover:text-plum'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className={isActive ? 'text-gold' : item.isAi ? 'text-gold' : 'text-plum/50'} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-plum/10 text-plum'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-plum/10 space-y-2">
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    onBackToHome();
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-plum/70 hover:text-plum hover:bg-ivory-warm rounded-lg flex items-center gap-2"
                >
                  <ArrowLeft size={14} />
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <OverviewView 
                onNavigate={(tab) => setActiveTab(tab)} 
                onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
                onShowToast={showToast}
              />
            )}
            {activeTab === 'events' && (
              <EventsView 
                onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
                onShowToast={showToast}
                onNavigateToOverview={() => setActiveTab('overview')}
              />
            )}
            {activeTab === 'budget' && (
              <BudgetView 
                onShowToast={showToast} 
                onNavigateToVenues={() => setActiveTab('venues')}
              />
            )}
            {activeTab === 'venues' && (
              <VenueDiscoveryView
                onShowToast={showToast}
                onNavigateToBudget={() => setActiveTab('budget')}
              />
            )}
            {activeTab === 'timeline' && <TimelineView onShowToast={showToast} />}
            {activeTab === 'moodboard' && <MoodboardView onShowToast={showToast} />}
            {activeTab === 'guests-vendors' && <GuestsVendorsView />}
            {activeTab === 'ai-assistant' && <AIAssistantView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* New Event Creation Modal */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
      />
    </div>
  );
};
