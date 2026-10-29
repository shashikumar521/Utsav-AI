import React from 'react';
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
    totalGuests,
    confirmedGuests,
    pendingGuests,
    daysRemaining,
    formatCurrency,
    budgetItems,
  } = useEvents();

  // If no event exists, show friendly empty state
  if (!activeEvent || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-2xl border border-[#E8E1D5] text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#F4EFE6] text-[#755a2a] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">celebration</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#392538] mb-2">
          What shall we plan today?
        </h2>
        <p className="text-xs sm:text-sm text-[#4C454A] mb-6 leading-relaxed">
          You don't have any celebrations planned yet. Create your first event to start organizing your budget, schedule, and guest list.
        </p>
        <button
          onClick={onOpenNewEventModal}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#392538] text-white text-xs sm:text-sm font-semibold hover:bg-[#231123] transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-base text-[#C5A46D]">add</span>
          <span>Create an Event</span>
        </button>
      </div>
    );
  }

  // Next few pending tasks (top 3, sorted by earliest due date)
  const nextTasks = [...tasks]
    .filter((t) => !t.completed)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 3);

  // Top budget categories summary
  const categoryTotals: Record<string, number> = {};
  budgetItems.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + (Number(item.planned) || 0);
  });
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const spentPercentage = totalBudget > 0 ? Math.min(100, Math.round((actualSpent / totalBudget) * 100)) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* =========================================================================
           TOP GREETING
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E8E1D5]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#392538]">
            Welcome back! What shall we plan today?
          </h1>
          <p className="text-xs text-[#4C454A] mt-1">
            Active celebration: <strong className="text-[#392538] font-semibold">{activeEvent.name || activeEvent.title}</strong>
          </p>
        </div>

        <button
          onClick={onOpenNewEventModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#392538] text-white text-xs font-semibold hover:bg-[#231123] transition-colors shadow-xs self-start sm:self-auto shrink-0"
        >
          <span className="material-symbols-outlined text-sm text-[#C5A46D]">add</span>
          <span>New Event</span>
        </button>
      </div>

      {/* =========================================================================
           FOUR SMALL SUMMARY CARDS
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Next Event */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4C454A]">
              Next Event
            </span>
            <button
              onClick={() => onNavigate('events')}
              className="text-[11px] font-semibold text-[#755a2a] hover:text-[#392538] transition-colors"
            >
              View All
            </button>
          </div>
          <div className="my-2">
            <h3 className="font-serif text-base font-bold text-[#392538] truncate" title={activeEvent.name}>
              {activeEvent.name || activeEvent.title}
            </h3>
            <p className="text-xs text-[#4C454A] mt-0.5 truncate">
              {new Date(activeEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {activeEvent.city || activeEvent.location}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E8E1D5]/60">
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#755a2a] bg-[#F4EFE6] px-2 py-0.5 rounded-md">
              <span className="material-symbols-outlined text-xs">schedule</span>
              <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Celebration today!'}</span>
            </div>
            <button
              onClick={() => onNavigate('venues')}
              className="text-[11px] font-semibold text-[#392538] hover:text-[#755a2a] inline-flex items-center gap-0.5"
            >
              <span>Find Venues</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Card 2: Budget Left */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4C454A]">
              Budget Left
            </span>
            <button
              onClick={() => onNavigate('budget')}
              className="text-[11px] font-semibold text-[#755a2a] hover:text-[#392538] transition-colors"
            >
              View All
            </button>
          </div>
          <div className="my-2">
            <div className="font-serif text-xl font-bold text-[#392538]">
              {formatCurrency(remainingBudget)}
            </div>
            <p className="text-xs text-[#4C454A] mt-0.5">
              of {formatCurrency(totalBudget)} total
            </p>
          </div>
          <div className="w-full bg-[#ECE6DA] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#392538] h-full rounded-full transition-all duration-300"
              style={{ width: `${100 - spentPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 3: Tasks Completed */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4C454A]">
              Tasks Completed
            </span>
            <button
              onClick={() => onNavigate('timeline')}
              className="text-[11px] font-semibold text-[#755a2a] hover:text-[#392538] transition-colors"
            >
              View All
            </button>
          </div>
          <div className="my-2">
            <div className="font-serif text-xl font-bold text-[#392538]">
              {completedTasks}{' '}
              <span className="text-xs font-sans text-[#4C454A] font-normal">
                of {totalTasks}
              </span>
            </div>
            <p className="text-xs text-[#4C454A] mt-0.5">
              {taskCompletionPercentage}% finished
            </p>
          </div>
          <div className="w-full bg-[#ECE6DA] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C5A46D] h-full rounded-full transition-all duration-300"
              style={{ width: `${taskCompletionPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 4: Guest Responses */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4C454A]">
              Guest Responses
            </span>
            <button
              onClick={() => onNavigate('guests-vendors')}
              className="text-[11px] font-semibold text-[#755a2a] hover:text-[#392538] transition-colors"
            >
              View All
            </button>
          </div>
          <div className="my-2">
            <div className="font-serif text-xl font-bold text-[#392538]">
              {confirmedGuests}{' '}
              <span className="text-xs font-sans text-[#4A6B53] font-semibold">
                Confirmed
              </span>
            </div>
            <p className="text-xs text-[#4C454A] mt-0.5">
              {pendingGuests} waiting · {totalGuests || activeEvent.guestCount} total
            </p>
          </div>
          <div className="text-[11px] text-[#4C454A] flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#4A6B53]" />
            <span>RSVPs in progress</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
           BELOW SUMMARY CARDS: ONLY 3 COMPACT PANELS
           1. Next few tasks
           2. Short budget summary
           3. One helpful AI suggestion
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel 1: Next Few Tasks */}
        <div className="p-5 bg-white rounded-2xl border border-[#E8E1D5] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-3">
              <h2 className="font-serif text-base font-semibold text-[#392538]">
                Next Tasks
              </h2>
              <button
                onClick={() => onNavigate('timeline')}
                className="text-xs font-semibold text-[#755a2a] hover:text-[#392538] transition-colors"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2.5">
              {nextTasks.length > 0 ? (
                nextTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#FAF7F0] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {
                        toggleTask(task.id);
                        onShowToast('Task marked complete!', 'success');
                      }}
                      className="mt-1 w-4 h-4 rounded text-[#392538] focus:ring-[#C5A46D] cursor-pointer"
                      id={`check-${task.id}`}
                    />
                    <label
                      htmlFor={`check-${task.id}`}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-[#392538] truncate">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-[#4C454A] truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                      <p className="text-[10px] text-[#755a2a] mt-0.5 font-medium">
                        Due: {task.dueDate} · {task.category}
                      </p>
                    </label>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[#4C454A]">
                  All current tasks are done!
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('timeline')}
            className="w-full mt-4 py-2 px-3 bg-[#FAF7F0] hover:bg-[#F4EFE6] text-[#392538] rounded-xl text-xs font-semibold border border-[#E8E1D5] transition-colors"
          >
            Manage Tasks
          </button>
        </div>

        {/* Panel 2: Short Budget Summary */}
        <div className="p-5 bg-white rounded-2xl border border-[#E8E1D5] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-3">
              <h2 className="font-serif text-base font-semibold text-[#392538]">
                Budget Summary
              </h2>
              <button
                onClick={() => onNavigate('budget')}
                className="text-xs font-semibold text-[#755a2a] hover:text-[#392538] transition-colors"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#4C454A]">Amount Spent:</span>
                  <span className="font-semibold text-[#392538]">{formatCurrency(actualSpent)}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#4C454A]">Amount Left:</span>
                  <span className="font-semibold text-[#755a2a]">{formatCurrency(remainingBudget)}</span>
                </div>
                <div className="w-full bg-[#ECE6DA] h-2 rounded-full overflow-hidden flex">
                  <div className="bg-[#392538] h-full" style={{ width: `${spentPercentage}%` }} />
                  <div className="bg-[#C5A46D] h-full" style={{ width: `${100 - spentPercentage}%` }} />
                </div>
              </div>

              {/* Top categories breakdown */}
              <div className="pt-2 border-t border-[#E8E1D5] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4C454A]">
                  Main Categories
                </span>
                {topCategories.map(([catName, amt]) => (
                  <div key={catName} className="flex items-center justify-between text-xs">
                    <span className="text-[#4C454A]">{catName}</span>
                    <span className="font-medium text-[#392538]">{formatCurrency(amt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('budget')}
            className="w-full mt-4 py-2 px-3 bg-[#FAF7F0] hover:bg-[#F4EFE6] text-[#392538] rounded-xl text-xs font-semibold border border-[#E8E1D5] transition-colors"
          >
            Manage Budget
          </button>
        </div>

        {/* Panel 3: One Helpful AI Suggestion */}
        <div className="p-5 bg-gradient-to-br from-[#F4EFE6] via-[#FAF7F0] to-white rounded-2xl border border-[#C5A46D]/40 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#E8E1D5] mb-3">
              <span className="material-symbols-outlined text-[#755a2a] text-lg">auto_awesome</span>
              <h2 className="font-serif text-base font-semibold text-[#392538]">
                Ideas for Your Event
              </h2>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A46D]/20 text-[#755a2a]">
                Budget Tip
              </span>
              <p className="text-xs text-[#392538] leading-relaxed">
                For your {activeEvent.type} in {activeEvent.city || activeEvent.location}, booking seasonal florals and brass urlis directly with local mandis can save up to 15% on decoration costs.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('ai-assistant')}
            className="w-full mt-4 py-2 px-3 bg-[#392538] hover:bg-[#231123] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Ask AI Planner</span>
            <span className="material-symbols-outlined text-xs text-[#C5A46D]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
