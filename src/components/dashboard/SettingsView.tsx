import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { 
  Settings as SettingsIcon, Globe, Printer, RotateCcw, ShieldCheck, 
  Download, User, Bell, Check, Sparkles, Building 
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const SettingsView: React.FC = () => {
  const { 
    currentEvent, 
    currency, 
    setCurrency, 
    resetToInitialData, 
    showToast,
    formatCurrency,
    events,
    budgetItems,
    tasks,
    guests,
    vendors
  } = useEvents();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [plannerName, setPlannerName] = useState('Ananya Mehta & Kabir Shah');
  const [plannerAgency, setPlannerAgency] = useState('Utsav Signature Weddings');
  const [plannerPhone, setPlannerPhone] = useState('+91 98250 88990');
  const [plannerEmail, setPlannerEmail] = useState('concierge@utsavai.com');

  const handlePrintDossier = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      currentEvent,
      budgetItems,
      tasks,
      guests,
      vendors
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const eventName = currentEvent?.title || currentEvent?.name || 'celebration';
    a.download = `utsav-ai-${eventName.toLowerCase().replace(/\s+/g, '-')}-dossier.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Event dossier exported successfully', 'success');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Host profile updated successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-plum/10">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-plum">
          Workspace Preferences & Dossier
        </h1>
        <p className="text-xs md:text-sm text-plum/60 mt-1">
          Configure regional currency, export physical briefing printouts, and govern event data
        </p>
      </div>

      {/* Grid of Settings Cards */}
      <div className="space-y-6">
        {/* Currency & Regional Settings */}
        <div className="bg-white rounded-xl border border-plum/10 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={18} className="text-terracotta" />
            <h2 className="font-serif text-lg font-semibold text-plum">
              Regional Currency & Accounting Format
            </h2>
          </div>
          <p className="text-xs text-plum/60 mb-4">
            Select the monetary system for all budget allocations, contract quotes, and analytics across Utsav AI.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { code: 'INR' as const, symbol: '₹', label: 'Indian Rupee (Lakhs/Crores)' },
              { code: 'USD' as const, symbol: '$', label: 'US Dollar (USD)' },
              { code: 'EUR' as const, symbol: '€', label: 'Euro (EUR)' },
              { code: 'GBP' as const, symbol: '£', label: 'British Pound (GBP)' },
              { code: 'AED' as const, symbol: 'AED', label: 'UAE Dirham (AED)' },
            ].map(curr => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code);
                  showToast(`Currency updated to ${curr.code}`, 'info');
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  currency === curr.code
                    ? 'border-plum bg-plum/5 ring-1 ring-plum'
                    : 'border-plum/15 hover:border-plum/30 bg-ivory-warm/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg font-bold text-plum">{curr.symbol}</span>
                  {currency === curr.code && <Check size={14} className="text-plum" />}
                </div>
                <div className="text-xs font-semibold text-plum mt-1">{curr.code}</div>
                <div className="text-[10px] text-plum/60 mt-0.5 line-clamp-1">{curr.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Host & Planning Lead Profile */}
        <div className="bg-white rounded-xl border border-plum/10 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <User size={18} className="text-gold" />
            <h2 className="font-serif text-lg font-semibold text-plum">
              Host & Planning Council Lead
            </h2>
          </div>
          <p className="text-xs text-plum/60 mb-4">
            These credentials are appended to exported vendor contracts, formal run-of-show dossiers, and RSVP invitations.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-plum mb-1">Host / Couple Primary Name</label>
                <input
                  type="text"
                  value={plannerName}
                  onChange={(e) => setPlannerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-plum mb-1">Production Agency / Household</label>
                <input
                  type="text"
                  value={plannerAgency}
                  onChange={(e) => setPlannerAgency(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-plum mb-1">Direct Mobile / WhatsApp</label>
                <input
                  type="tel"
                  value={plannerPhone}
                  onChange={(e) => setPlannerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-plum mb-1">Lead Email for Vendor Approvals</label>
                <input
                  type="email"
                  value={plannerEmail}
                  onChange={(e) => setPlannerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-plum text-ivory-warm text-xs font-semibold rounded-lg hover:bg-plum-light transition-all shadow-xs"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Physical Print & Digital Dossier Export */}
        <div className="bg-white rounded-xl border border-plum/10 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Printer size={18} className="text-plum" />
            <h2 className="font-serif text-lg font-semibold text-plum">
              Printable Event Dossier & Digital Backup
            </h2>
          </div>
          <p className="text-xs text-plum/60 mb-4">
            Generate physical briefing binders for vendors on ceremony day, or download raw JSON backups of all timelines and budgets.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrintDossier}
              className="px-4 py-2.5 bg-ivory-warm hover:bg-plum/10 text-plum border border-plum/20 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-xs"
            >
              <Printer size={15} />
              Print Master Run-of-Show Dossier
            </button>

            <button
              onClick={handleExportJSON}
              className="px-4 py-2.5 bg-ivory-warm hover:bg-plum/10 text-plum border border-plum/20 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-xs"
            >
              <Download size={15} />
              Export Full JSON Archive
            </button>
          </div>

          <div className="mt-4 p-3 bg-ivory-warm/40 rounded-lg border border-plum/10 text-[11px] text-plum/70 leading-relaxed">
            <strong>Print Note:</strong> When printing, browser headers and background graphics are automatically formatted into a crisp editorial briefing sheet suitable for site coordinators and stage managers.
          </div>
        </div>

        {/* Danger Zone: Restore Defaults */}
        <div className="bg-rose-50/50 rounded-xl border border-rose-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw size={18} className="text-rose-600" />
            <h2 className="font-serif text-lg font-semibold text-rose-950">
              Restore Sample Celebration Data
            </h2>
          </div>
          <p className="text-xs text-rose-800/80 mb-4">
            Reset all events, budget allocations, guest lists, and tasks back to the curated Utsav AI sample celebration (Ananya & Kabir's Sunset Wedding).
          </p>

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
          >
            <RotateCcw size={14} />
            Reset to Sample Celebration
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Restore Demonstration Celebration?"
        message="This action will clear all customized events, tasks, guests, and budget records currently in your browser storage and repopulate the curated Gujarati-Rajput royal celebration archive."
        confirmLabel="Yes, Reset Data"
        isDestructive={true}
        onConfirm={() => {
          resetToInitialData();
          setIsResetModalOpen(false);
        }}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
