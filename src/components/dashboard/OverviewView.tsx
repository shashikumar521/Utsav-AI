import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { ActiveTab } from '../../types';

interface OverviewViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewEventModal: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenNewEventModal,
  onShowToast,
}) => {
  const {
    activeEvent,
    events,
    totalBudget,
    actualSpent,
    remainingBudget,
    tasks,
    toggleTask,
    totalTasks,
    completedTasks,
    taskCompletionPercentage,
    guests,
    totalGuests,
    confirmedGuests,
    pendingGuests,
    declinedGuests,
    daysRemaining,
    formatCurrency,
    budgetItems,
  } = useEvents();

  const [aiAlertApplied, setAiAlertApplied] = useState(false);

  // If no active event exists, show onboarding empty state
  if (!activeEvent || events.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-[#E8E1D5] text-center min-h-[450px]">
        <div className="w-16 h-16 rounded-2xl bg-[#F4EFE6] text-[#755a2a] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">celebration</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#392538] mb-2">
          Begin Your Celebration Journey
        </h2>
        <p className="font-sans text-sm text-[#4C454A] max-w-md mb-6 leading-relaxed">
          You don't have an active celebration dossier yet. Create your first event plan to unlock the AI Budget Studio, Timeline Tracker, and Moodboard Atelier.
        </p>
        <button
          onClick={onOpenNewEventModal}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#392538] text-white text-sm font-semibold hover:bg-[#231123] transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-base text-[#C5A46D]">add</span>
          <span>Create Your First Event</span>
        </button>
      </div>
    );
  }

  // Get urgent tasks (top 3 pending tasks)
  const urgentTasks = tasks.filter(t => !t.completed).slice(0, 3);

  // Calculate budget category percentages for active event
  const categoryTotals: Record<string, number> = {};
  budgetItems.forEach(b => {
    categoryTotals[b.category] = (categoryTotals[b.category] || 0) + (Number(b.planned) || 0);
  });

  const cateringPercent = totalBudget > 0 ? Math.round(((categoryTotals['Catering'] || 0) / totalBudget) * 100) : 38;
  const decorPercent = totalBudget > 0 ? Math.round(((categoryTotals['Decoration'] || 0) / totalBudget) * 100) : 28;
  const photoPercent = totalBudget > 0 ? Math.round(((categoryTotals['Photography'] || 0) / totalBudget) * 100) : 14;
  const entertainmentPercent = totalBudget > 0 ? Math.round(((categoryTotals['Entertainment'] || 0) / totalBudget) * 100) : 12;

  const handleApplyAiAlert = () => {
    setAiAlertApplied(true);
    onShowToast('Locked ₹18,000 wholesale marigold savings into Budget Studio!', 'success');
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 gap-3.5">
      {/* =========================================================================
           TOP GREETING & HIGH-ELEVATION STATUS STRIP
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 bg-gradient-to-r from-[#F4EFE6] to-[#FAF7F0] rounded-xl border border-[#E8E1D5]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] text-[#755a2a] font-serif tracking-widest uppercase shrink-0">
            Namaste
          </span>
          <span className="text-[#E8E1D5]">/</span>
          <p className="text-sm sm:text-base text-[#392538] font-medium truncate">
            Welcome back, <span className="font-serif italic font-semibold">Host!</span> Let's make {activeEvent.name} unforgettable.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#755a2a] text-xs font-semibold shadow-2xs border border-[#E8E1D5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D] animate-ping" />
            <span>{taskCompletionPercentage}% Prepared</span>
          </div>
          <span className="text-[10px] text-[#4C454A] font-mono">
            {activeEvent.type}
          </span>
        </div>
      </div>

      {/* =========================================================================
           4 COMPACT SUMMARY CARDS (Balanced Metric Bar)
      ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Metric 1: Countdown */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white shadow-xs border border-[#E8E1D5]">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4C454A] uppercase tracking-wider font-semibold">
              Celebration Date
            </span>
            <span className="font-serif text-lg sm:text-xl text-[#392538] font-semibold mt-0.5">
              {new Date(activeEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-xs text-[#755a2a] font-medium">
              {daysRemaining} Days to Go
            </span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#ECE6DA]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
              />
              <path
                className="text-[#C5A46D]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${Math.min(100, Math.max(10, 100 - daysRemaining * 2))}, 100`}
                strokeLinecap="round"
                strokeWidth="3.2"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-[#392538]">
              {Math.min(100, Math.max(10, 100 - daysRemaining * 2))}%
            </span>
          </div>
        </div>

        {/* Metric 2: Budget Health */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white shadow-xs border border-[#E8E1D5]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#4C454A] uppercase tracking-wider font-semibold">
              Total Budget
            </span>
            <span className="text-[10px] text-[#755a2a] font-bold">
              {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="my-1">
            <span className="font-serif text-lg sm:text-xl text-[#392538] font-semibold">
              {formatCurrency(remainingBudget)}
            </span>
            <span className="text-[10px] text-[#4C454A] block">
              Remaining Unlocked
            </span>
          </div>
          <div className="w-full bg-[#ECE6DA] h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-[#392538] h-full"
              style={{
                width: `${totalBudget > 0 ? Math.min(100, (actualSpent / totalBudget) * 100) : 0}%`,
              }}
              title={`Spent: ${formatCurrency(actualSpent)}`}
            />
            <div
              className="bg-[#C5A46D] h-full"
              style={{
                width: `${totalBudget > 0 ? Math.max(0, (remainingBudget / totalBudget) * 100) : 100}%`,
              }}
              title={`Remaining: ${formatCurrency(remainingBudget)}`}
            />
          </div>
        </div>

        {/* Metric 3: Task Completion */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white shadow-xs border border-[#E8E1D5]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#4C454A] uppercase tracking-wider font-semibold">
              Planning Tasks
            </span>
            <span className="text-[10px] text-[#392538] font-semibold px-1.5 py-0.5 rounded bg-[#F4EFE6]">
              {taskCompletionPercentage}%
            </span>
          </div>
          <div className="my-1">
            <span className="font-serif text-lg sm:text-xl text-[#392538] font-semibold">
              {completedTasks}{' '}
              <span className="font-sans text-xs text-[#4C454A] font-normal">
                / {totalTasks}
              </span>
            </span>
            <span className="text-[10px] text-[#4C454A] block">
              {totalTasks - completedTasks} Pending Checkpoints
            </span>
          </div>
          <div className="w-full bg-[#ECE6DA] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C5A46D] h-full rounded-full transition-all duration-300"
              style={{ width: `${taskCompletionPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Guest RSVP Summary */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white shadow-xs border border-[#E8E1D5]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#4C454A] uppercase tracking-wider font-semibold">
              Guest RSVPs
            </span>
            <span className="text-[10px] text-[#755a2a] font-medium">
              Scale: {activeEvent.guestCount}
            </span>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="font-serif text-lg sm:text-xl text-[#392538] font-semibold">
              {confirmedGuests}
            </span>
            <span className="text-xs text-[#4A6B53] font-semibold">
              Confirmed
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#4C454A]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D]" /> {pendingGuests} Awaited
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C97862]" /> {declinedGuests} Declined
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
           BALANCED TWO-COLUMN LAPTOP WORKBENCH
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* LEFT COLUMN: Urgent Critical Tasks + Chronological Horizon (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Urgent Critical Tasks */}
          <div className="p-4 bg-white rounded-xl shadow-xs border border-[#E8E1D5] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#392538]">priority_high</span>
                <h3 className="font-serif text-base font-semibold text-[#392538]">
                  Urgent Critical Tasks
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4EFE6] text-[#755a2a]">
                  {urgentTasks.length} Due Soon
                </span>
              </div>
              <button
                onClick={() => onNavigate('timeline')}
                className="text-xs text-[#755a2a] hover:text-[#392538] font-semibold transition-colors flex items-center gap-0.5"
              >
                <span>View All Tasks</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

            {/* Task Items */}
            <div className="flex flex-col gap-2">
              {urgentTasks.length > 0 ? (
                urgentTasks.map(task => (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between p-2.5 rounded-lg bg-[#FAF7F0] hover:bg-[#F4EFE6] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          toggleTask(task.id);
                          onShowToast(
                            task.completed ? 'Task reopened' : 'Milestone task completed!',
                            'success'
                          );
                        }}
                        className="w-4 h-4 rounded text-[#392538] focus:ring-[#C5A46D] cursor-pointer"
                        id={`task-${task.id}`}
                      />
                      <div className="flex flex-col min-w-0">
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`text-xs font-semibold text-[#392538] truncate cursor-pointer ${
                            task.completed ? 'line-through opacity-50' : ''
                          }`}
                        >
                          {task.title}
                        </label>
                        <span className="text-[10px] text-[#4C454A] flex items-center gap-1.5">
                          <span className="text-[#C97862] font-semibold">
                            Due: {task.dueDate}
                          </span>
                          <span>·</span>
                          <span>{task.assignee || 'Assigned'}</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#4C454A] font-medium border border-[#E8E1D5] shrink-0">
                      {task.category}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#4C454A] bg-[#FAF7F0] rounded-lg">
                  All urgent checkpoints completed! Check Timeline for future milestones.
                </div>
              )}
            </div>
          </div>

          {/* Chronological Milestone Horizon Tracker */}
          <div className="p-4 bg-white rounded-xl shadow-xs border border-[#E8E1D5] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#C5A46D]">alt_route</span>
                <h3 className="font-serif text-base font-semibold text-[#392538]">
                  Celebration Horizon
                </h3>
              </div>
              <span className="text-[11px] text-[#4C454A] font-medium">Phase 3 of 5</span>
            </div>

            {/* Horizontal Track */}
            <div className="relative flex items-center justify-between mt-3 py-1">
              <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-0.5 bg-[#ECE6DA] -z-0" />

              {/* Node 1: Completed */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-6 h-6 rounded-full bg-[#C5A46D] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-xs">check</span>
                </div>
                <span className="text-[10px] text-[#4C454A] font-medium">Concept</span>
              </div>

              {/* Node 2: Completed */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-6 h-6 rounded-full bg-[#C5A46D] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-xs">check</span>
                </div>
                <span className="text-[10px] text-[#4C454A] font-medium">Vendors</span>
              </div>

              {/* Node 3: Active Stage */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-7 h-7 rounded-full bg-[#392538] text-[#C5A46D] flex items-center justify-center ring-4 ring-[#C5A46D]/30 shadow-sm animate-pulse">
                  <span className="material-symbols-outlined text-xs">flag</span>
                </div>
                <span className="text-[10px] text-[#392538] font-bold">Logistics</span>
              </div>

              {/* Node 4: Upcoming */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-6 h-6 rounded-full bg-[#ECE6DA] text-[#4C454A] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs">celebration</span>
                </div>
                <span className="text-[10px] text-[#4C454A]">Rehearsals</span>
              </div>

              {/* Node 5: Destination */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-6 h-6 rounded-full bg-[#ECE6DA] text-[#4C454A] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs">favorite</span>
                </div>
                <span className="text-[10px] text-[#4C454A]">Event Day</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Budget Breakdown + AI Insight Concierge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Budget Breakdown Snapshot */}
          <div className="p-4 bg-white rounded-xl shadow-xs border border-[#E8E1D5] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#392538]">pie_chart</span>
                <h3 className="font-serif text-base font-semibold text-[#392538]">
                  Budget Breakdown
                </h3>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F4EFE6] hover:bg-[#ECE6DA] text-[#755a2a] text-[11px] font-semibold transition-all"
              >
                <span>Budget Studio</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            {/* Segmented Color Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#ECE6DA] my-2">
              <div className="bg-[#392538] h-full" style={{ width: `${cateringPercent}%` }} title={`Catering ${cateringPercent}%`} />
              <div className="bg-[#C5A46D] h-full" style={{ width: `${decorPercent}%` }} title={`Decor ${decorPercent}%`} />
              <div className="bg-[#C97862] h-full" style={{ width: `${photoPercent}%` }} title={`Photo ${photoPercent}%`} />
              <div className="bg-[#755a2a] h-full" style={{ width: `${entertainmentPercent}%` }} title={`Music ${entertainmentPercent}%`} />
            </div>

            {/* Category Percentages Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-1 text-[11px] text-[#4C454A]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#392538]" /> Catering
                </span>
                <span className="font-semibold text-[#392538]">{cateringPercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#C5A46D]" /> Decor & Floral
                </span>
                <span className="font-semibold text-[#392538]">{decorPercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#C97862]" /> Photography
                </span>
                <span className="font-semibold text-[#392538]">{photoPercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#755a2a]" /> Music & Sangeet
                </span>
                <span className="font-semibold text-[#392538]">{entertainmentPercent}%</span>
              </div>
            </div>
          </div>

          {/* Utsav AI Recommendation Panel */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#F4EFE6] via-[#FAF7F0] to-white shadow-xs border border-[#C5A46D] flex flex-col justify-between">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#392538] text-[#C5A46D] flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-lg">smart_toy</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[#392538]">AI Concierge Market Alert</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C5A46D]/20 text-[#755a2a] font-bold">
                    Save ₹18,000
                  </span>
                </div>
                <p className="text-xs text-[#4C454A] mt-1 leading-snug">
                  Marigold and jasmine wholesale rates in {activeEvent.location.split(',')[0]} peak on <strong>Nov 10</strong> for festival demand. Locking local florists before Friday saves approx <strong>₹18,000</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#DFD7C7]">
              <button
                onClick={handleApplyAiAlert}
                disabled={aiAlertApplied}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                  aiAlertApplied
                    ? 'bg-[#4A6B53] text-white cursor-default'
                    : 'bg-[#392538] text-white hover:bg-[#231123]'
                }`}
              >
                {aiAlertApplied ? '✓ Rate Locked with Local Mandi' : 'Apply Recommendation'}
              </button>
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="py-1.5 px-3 rounded-lg bg-white text-[#392538] hover:bg-[#F4EFE6] text-xs font-semibold transition-all border border-[#E8E1D5]"
              >
                Discuss with AI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
           FLOATING QUICK-SWITCHER TABS BAR
      ========================================================================= */}
      <nav
        aria-label="Quick Switcher Tabs"
        className="flex items-center justify-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-xs mx-auto max-w-lg w-full border border-[#E8E1D5]"
      >
        <button
          onClick={() => onNavigate('budget')}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-[#4C454A] hover:text-[#392538] hover:bg-[#F4EFE6] text-xs font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
          <span>Budget</span>
        </button>
        <span className="text-[#E8E1D5]">·</span>
        <button
          onClick={() => onNavigate('timeline')}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-[#4C454A] hover:text-[#392538] hover:bg-[#F4EFE6] text-xs font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-sm">event_available</span>
          <span>Timeline</span>
        </button>
        <span className="text-[#E8E1D5]">·</span>
        <button
          onClick={() => onNavigate('moodboard')}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-[#4C454A] hover:text-[#392538] hover:bg-[#F4EFE6] text-xs font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-sm">image</span>
          <span>Moodboard</span>
        </button>
        <span className="text-[#E8E1D5]">·</span>
        <button
          onClick={() => onNavigate('guests')}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-[#4C454A] hover:text-[#392538] hover:bg-[#F4EFE6] text-xs font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-sm">group</span>
          <span>Guests</span>
        </button>
        <span className="text-[#E8E1D5]">·</span>
        <button
          onClick={() => onNavigate('ai-assistant')}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#C5A46D]/15 text-[#755a2a] hover:bg-[#C5A46D]/25 text-xs font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          <span>AI Assistant</span>
        </button>
      </nav>
    </div>
  );
};
