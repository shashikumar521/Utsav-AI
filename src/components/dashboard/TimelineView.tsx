import React, { useState, useMemo } from 'react';
import { useEvents } from '../../context/EventContext';
import { TaskItem, TaskPriority, TaskStage } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { getRelativeDeadlineLabel, calculateRealisticDueDate } from '../../utils/taskGenerator';

interface TimelineViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const STAGE_CONFIG: Record<
  string,
  { label: string; shortLabel: string; timeline: string; icon: string; description: string; color: string }
> = {
  'planning': {
    label: 'Planning',
    shortLabel: 'Planning',
    timeline: '2–3 weeks before',
    icon: 'assignment',
    description: 'Lay the groundwork, confirm budget, book venue, and invite guests.',
    color: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  'one-week-before': {
    label: '1 Week Before',
    shortLabel: '1 Week',
    timeline: '7 days before',
    icon: 'hourglass_top',
    description: 'Confirm suppliers, purchase supplies, finalize menu, and follow up on RSVPs.',
    color: 'bg-blue-50 text-blue-900 border-blue-200',
  },
  'one-day-before': {
    label: '1 Day Before',
    shortLabel: '1 Day',
    timeline: '24 hours before',
    icon: 'pending_actions',
    description: 'Pick up cake/supplies, assemble decorations, pack essentials, and final checks.',
    color: 'bg-purple-50 text-purple-900 border-purple-200',
  },
  'event-day': {
    label: 'Celebration Day',
    shortLabel: 'Event Day',
    timeline: 'Day of celebration',
    icon: 'celebration',
    description: 'Set up venue, welcome guests, coordinate timings, cake cutting, and celebrate.',
    color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  },
  'after-event': {
    label: 'After the Event',
    shortLabel: 'Post Event',
    timeline: '1–2 days after',
    icon: 'task_alt',
    description: 'Settle remaining payments, clean up the space, and send thank-you notes.',
    color: 'bg-stone-100 text-stone-800 border-stone-200',
  },
};

const CATEGORIES = [
  'Decorations',
  'Food',
  'Venue',
  'Guests',
  'Ceremony',
  'Entertainment',
  'Logistics',
  'Hospitality',
  'Photography',
  'Budget',
  'Attire',
  'AV & Tech',
  'General',
];

export const TimelineView: React.FC<TimelineViewProps> = ({ onShowToast }) => {
  const {
    activeEvent,
    tasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    totalTasks,
    completedTasks,
    taskCompletionPercentage,
    generateTasksForEvent,
    updateTaskDeadlinesForEvent,
  } = useEvents();

  // Filters & View Modes
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [stageFilter, setStageFilter] = useState<'all' | TaskStage | string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByStage, setGroupByStage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [notesModalTask, setNotesModalTask] = useState<TaskItem | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Decorations');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formStage, setFormStage] = useState<TaskStage>('planning');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAssignee, setFormAssignee] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute counts
  const overdueCount = useMemo(() => {
    return tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  }, [tasks, todayStr]);

  const todayCount = useMemo(() => {
    return tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
  }, [tasks, todayStr]);

  const upcomingCount = useMemo(() => {
    return tasks.filter(t => !t.completed && t.dueDate && t.dueDate > todayStr).length;
  }, [tasks, todayStr]);

  // Stage default days for date picker recommendation
  const handleStageChange = (newStage: TaskStage) => {
    setFormStage(newStage);
    if (activeEvent?.date) {
      const daysMap: Record<string, number> = {
        'planning': 18,
        'one-week-before': 7,
        'one-day-before': 1,
        'event-day': 0,
        'after-event': -1,
      };
      const daysBefore = daysMap[newStage] ?? 7;
      setFormDueDate(calculateRealisticDueDate(activeEvent.date, daysBefore));
    }
  };

  const openAddModal = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Decorations');
    setFormPriority('medium');
    setFormStage('planning');
    setFormAssignee('Host Council');
    setFormNotes('');
    setFormError('');
    if (activeEvent?.date) {
      setFormDueDate(calculateRealisticDueDate(activeEvent.date, 18));
    } else {
      setFormDueDate(todayStr);
    }
    setIsAddModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormCategory(task.category || 'General');
    setFormPriority(task.priority || 'medium');
    setFormStage((task.stage as TaskStage) || 'planning');
    setFormDueDate(task.dueDate || todayStr);
    setFormAssignee(task.assignee || '');
    setFormNotes(task.notes || '');
    setFormError('');
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Task title is required.');
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        category: formCategory,
        priority: formPriority,
        stage: formStage,
        dueDate: formDueDate || todayStr,
        assignee: formAssignee.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });
      onShowToast(`Updated task: "${formTitle}"`, 'success');
      setEditingTask(null);
    } else {
      addTask({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        category: formCategory,
        priority: formPriority,
        stage: formStage,
        dueDate: formDueDate || todayStr,
        completed: false,
        assignee: formAssignee.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });
      onShowToast(`Added new task: "${formTitle}"`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    onShowToast(`Removed task: "${taskToDelete.title}"`, 'info');
    setTaskToDelete(null);
  };

  const handleGenerateChecklist = async () => {
    if (!activeEvent) return;
    setIsGenerating(true);
    try {
      await generateTasksForEvent(activeEvent.id);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSyncDeadlines = () => {
    if (!activeEvent?.date) return;
    updateTaskDeadlinesForEvent(activeEvent.id, activeEvent.date);
  };

  // Filtered task collection
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Quick filter
      if (filterTab === 'today') {
        if (task.completed || task.dueDate !== todayStr) return false;
      } else if (filterTab === 'upcoming') {
        if (task.completed || !task.dueDate || task.dueDate <= todayStr) return false;
      } else if (filterTab === 'overdue') {
        if (task.completed || !task.dueDate || task.dueDate >= todayStr) return false;
      } else if (filterTab === 'completed') {
        if (!task.completed) return false;
      }

      // Stage filter
      if (stageFilter !== 'all') {
        const taskStage = task.stage || 'planning';
        if (taskStage !== stageFilter) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        const matchesCat = (task.category || '').toLowerCase().includes(query);
        const matchesAssignee = (task.assignee || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesAssignee) return false;
      }

      return true;
    });
  }, [tasks, filterTab, stageFilter, priorityFilter, categoryFilter, searchQuery, todayStr]);

  // Stage grouping
  const STAGES_ORDER: TaskStage[] = ['planning', 'one-week-before', 'one-day-before', 'event-day', 'after-event'];

  const groupedTasks = useMemo(() => {
    const groups: Record<string, TaskItem[]> = {
      'planning': [],
      'one-week-before': [],
      'one-day-before': [],
      'event-day': [],
      'after-event': [],
    };

    filteredTasks.forEach(task => {
      const stage = (task.stage as TaskStage) || 'planning';
      if (groups[stage]) {
        groups[stage].push(task);
      } else {
        groups['planning'].push(task);
      }
    });

    return groups;
  }, [filteredTasks]);

  const celebrationType = activeEvent?.eventType || activeEvent?.type || 'Celebration';
  const celebrationName = activeEvent?.title || activeEvent?.name || 'Celebration';

  const renderTaskCard = (task: TaskItem) => {
    const { label: deadlineLabel, isOverdue, isToday, isEventDay } = getRelativeDeadlineLabel(
      task.dueDate,
      activeEvent?.date
    );

    const stageCfg = STAGE_CONFIG[task.stage || 'planning'] || STAGE_CONFIG['planning'];

    return (
      <div
        key={task.id}
        className={`p-3.5 sm:p-4 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
          task.completed ? 'bg-slate-50/50 opacity-75' : 'hover:bg-[#FAF7F0]/60'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => {
              toggleTask(task.id);
              onShowToast(
                task.completed ? 'Task reopened' : 'Milestone achieved!',
                'success'
              );
            }}
            className="mt-1 w-4 h-4 rounded text-[#392538] focus:ring-[#C5A46D] cursor-pointer shrink-0 accent-[#392538]"
            id={`task-item-${task.id}`}
          />

          <div className="flex flex-col min-w-0 flex-1">
            {/* Title & Stage Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor={`task-item-${task.id}`}
                className={`text-sm font-semibold text-[#392538] cursor-pointer ${
                  task.completed ? 'line-through text-stone-500' : ''
                }`}
              >
                {task.title}
              </label>

              {/* Stage Pill */}
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${stageCfg.color}`}
              >
                {stageCfg.shortLabel}
              </span>
            </div>

            {/* Description (what to do) */}
            {task.description && (
              <p
                className={`text-xs text-[#4C454A] mt-1 line-clamp-2 ${
                  task.completed ? 'text-stone-400' : ''
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Meta details bar */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#4C454A]">
              {/* Category */}
              <span className="font-semibold text-[#755a2a] bg-[#FAF7F0] px-2 py-0.5 rounded border border-[#E8E1D5] text-[10px]">
                {task.category || 'General'}
              </span>

              <span>·</span>

              {/* Due Date with relative intelligence */}
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  isOverdue
                    ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200'
                    : isToday
                    ? 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200'
                    : isEventDay
                    ? 'text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200'
                    : 'text-[#4C454A]'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {isOverdue ? 'warning' : isToday ? 'schedule' : isEventDay ? 'celebration' : 'calendar_today'}
                </span>
                <span>{deadlineLabel}</span>
              </span>

              {/* Assignee */}
              {task.assignee && (
                <>
                  <span>·</span>
                  <span className="text-[11px] text-[#4C454A] inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px] text-[#755a2a]">person</span>
                    <span>{task.assignee}</span>
                  </span>
                </>
              )}

              {/* Notes Indicator */}
              {task.notes && task.notes !== task.description && (
                <button
                  onClick={() => setNotesModalTask(task)}
                  className="text-[10px] text-[#755a2a] hover:underline inline-flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[11px]">sticky_note_2</span>
                  <span>Notes</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions & Priority */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
          {/* Priority Badge */}
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              task.priority === 'high'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : task.priority === 'medium'
                ? 'bg-[#C5A46D]/15 text-[#755a2a] border border-[#C5A46D]/30'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {task.priority || 'medium'}
          </span>

          {/* Edit button */}
          <button
            onClick={() => openEditModal(task)}
            className="p-1.5 rounded-lg text-[#4C454A] hover:text-[#392538] hover:bg-[#F4EFE6] transition"
            title="Edit task"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>

          {/* Delete button */}
          <button
            onClick={() => setTaskToDelete(task)}
            className="p-1.5 rounded-lg text-[#4C454A] hover:text-red-600 hover:bg-red-50 transition"
            title="Delete task"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* =========================================================================
           TOP SUMMARY & ACTION BAR
      ========================================================================= */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a] bg-[#F4EFE6] px-2 py-0.5 rounded">
                Real-World Checklist
              </span>
              <span className="text-xs text-[#4C454A]">·</span>
              <span className="text-xs font-semibold text-[#392538]">{celebrationType}</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#392538] mt-1">
              Tasks &amp; Timeline
            </h2>
            <p className="text-xs text-[#4C454A] mt-0.5">
              Realistic, step-by-step checklist tailored for{' '}
              <strong className="text-[#392538]">{celebrationName}</strong> on{' '}
              <span className="text-[#755a2a] font-semibold">{activeEvent?.date || 'TBD'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncDeadlines}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F0] text-[#392538] hover:bg-[#F4EFE6] border border-[#E8E1D5] text-xs font-semibold transition shadow-2xs"
              title="Align all task deadlines with the current celebration date"
            >
              <span className="material-symbols-outlined text-sm text-[#755a2a]">update</span>
              <span>Sync Deadlines</span>
            </button>

            <button
              onClick={handleGenerateChecklist}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4EFE6] text-[#392538] hover:bg-[#ECE6DA] text-xs font-semibold transition disabled:opacity-50 shadow-2xs"
              title="Generate or update realistic event-specific tasks"
            >
              <span className={`material-symbols-outlined text-sm text-[#755a2a] ${isGenerating ? 'animate-spin' : ''}`}>
                auto_fix_high
              </span>
              <span>{isGenerating ? 'Generating...' : 'Generate Checklist'}</span>
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#392538] text-white text-xs font-semibold hover:bg-[#231123] transition shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-[#C5A46D]">add</span>
              <span>Add Custom Task</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E8E1D5]">
          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Total Tasks
            </span>
            <p className="font-serif text-xl font-bold text-[#392538] mt-0.5">
              {totalTasks}
            </p>
            <span className="text-[11px] text-[#4C454A]">
              {completedTasks} completed ({taskCompletionPercentage}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Due Today
            </span>
            <p className="font-serif text-xl font-bold text-[#C5A46D] mt-0.5">
              {todayCount}
            </p>
            <span className="text-[11px] text-[#4C454A]">Scheduled for today</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Upcoming
            </span>
            <p className="font-serif text-xl font-bold text-[#392538] mt-0.5">
              {upcomingCount}
            </p>
            <span className="text-[11px] text-[#4C454A]">Pre-event milestones</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Overdue Status
            </span>
            <p className={`font-serif text-xl font-bold mt-0.5 ${overdueCount > 0 ? 'text-red-600' : 'text-[#4A6B53]'}`}>
              {overdueCount}
            </p>
            <span className="text-[11px] text-[#4C454A]">
              {overdueCount > 0 ? 'Action required' : 'All on track'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between items-center text-xs text-[#4C454A]">
            <span>Timeline Progress</span>
            <span className="font-semibold text-[#392538]">
              {completedTasks} of {totalTasks} checklist items completed ({taskCompletionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-[#ECE6DA] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C5A46D] h-full rounded-full transition-all duration-500"
              style={{ width: `${taskCompletionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
           SMART FILTER & VIEW SWITCHER BAR
      ========================================================================= */}
      <div className="p-3 bg-white rounded-xl border border-[#E8E1D5] shadow-xs flex flex-col gap-3">
        {/* Main Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'all' ? 'bg-[#392538] text-white shadow-2xs' : 'text-[#4C454A] hover:bg-[#F4EFE6]'
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setFilterTab('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'today' ? 'bg-[#392538] text-white shadow-2xs' : 'text-[#4C454A] hover:bg-[#F4EFE6]'
              }`}
            >
              Today's Tasks ({todayCount})
            </button>
            <button
              onClick={() => setFilterTab('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'upcoming' ? 'bg-[#392538] text-white shadow-2xs' : 'text-[#4C454A] hover:bg-[#F4EFE6]'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setFilterTab('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'overdue'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : overdueCount > 0
                  ? 'text-red-700 bg-red-50 hover:bg-red-100 font-bold'
                  : 'text-[#4C454A] hover:bg-[#F4EFE6]'
              }`}
            >
              Overdue ({overdueCount})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'completed' ? 'bg-[#392538] text-white shadow-2xs' : 'text-[#4C454A] hover:bg-[#F4EFE6]'
              }`}
            >
              Completed ({completedTasks})
            </button>
          </div>

          {/* Group by Stage Toggle */}
          <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-lg border border-[#E8E1D5]">
            <button
              onClick={() => setGroupByStage(true)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition ${
                groupByStage ? 'bg-white text-[#392538] shadow-2xs' : 'text-[#4C454A] hover:text-[#392538]'
              }`}
              title="Group tasks by chronological stages"
            >
              <span className="material-symbols-outlined text-xs">calendar_view_week</span>
              <span>Stage View</span>
            </button>
            <button
              onClick={() => setGroupByStage(false)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition ${
                !groupByStage ? 'bg-white text-[#392538] shadow-2xs' : 'text-[#4C454A] hover:text-[#392538]'
              }`}
              title="Show all tasks in a single list"
            >
              <span className="material-symbols-outlined text-xs">format_list_bulleted</span>
              <span>List View</span>
            </button>
          </div>
        </div>

        {/* Stage Filter Chips & Search */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8E1D5]/70">
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#755a2a] mr-1">Stage:</span>
            <button
              onClick={() => setStageFilter('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                stageFilter === 'all'
                  ? 'bg-[#392538] text-white font-semibold'
                  : 'text-[#4C454A] bg-[#FAF7F0] hover:bg-[#F4EFE6]'
              }`}
            >
              All Stages
            </button>
            {STAGES_ORDER.map(s => {
              const cfg = STAGE_CONFIG[s];
              const count = tasks.filter(t => (t.stage || 'planning') === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStageFilter(s)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                    stageFilter === s
                      ? 'bg-[#392538] text-white font-semibold'
                      : 'text-[#4C454A] bg-[#FAF7F0] hover:bg-[#F4EFE6]'
                  }`}
                >
                  {cfg.shortLabel} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#755a2a]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search checklist..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A46D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#4C454A] hover:text-[#392538]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Priority & Category dropdowns */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#4C454A]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[#755a2a]">Priority:</span>
            {(['all', 'high', 'medium', 'low'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-0.5 rounded text-[11px] capitalize transition ${
                  priorityFilter === p
                    ? 'bg-[#F4EFE6] text-[#392538] font-bold border border-[#C5A46D]'
                    : 'hover:bg-[#FAF7F0] text-[#4C454A]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[10px] uppercase font-bold text-[#755a2a]">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2 py-1 rounded bg-[#FAF7F0] border border-[#E8E1D5] text-[11px] text-[#392538]"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
           TASK LIST CONTENT (GROUPED BY STAGE OR FLAT LIST)
      ========================================================================= */}
      {filteredTasks.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] flex items-center justify-center text-[#755a2a]">
            <span className="material-symbols-outlined text-2xl">event_available</span>
          </div>
          <h3 className="font-serif text-base font-bold text-[#392538]">
            No checklist items match your filters
          </h3>
          <p className="text-xs text-[#4C454A] max-w-md">
            Try adjusting your search or stage filters, or click "Generate Checklist" to automatically create real-world tasks for {celebrationName}.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => {
                setFilterTab('all');
                setStageFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] text-[#392538] hover:bg-[#F4EFE6] text-xs font-semibold border border-[#E8E1D5]"
            >
              Reset Filters
            </button>
            <button
              onClick={handleGenerateChecklist}
              className="px-3 py-1.5 rounded-xl bg-[#392538] text-white hover:bg-[#231123] text-xs font-semibold shadow-xs"
            >
              Generate Checklist
            </button>
          </div>
        </div>
      ) : groupByStage && stageFilter === 'all' ? (
        // STAGE VIEW: Chronological accordion/sections
        <div className="space-y-4">
          {STAGES_ORDER.map(stageKey => {
            const stageTasks = groupedTasks[stageKey] || [];
            if (stageTasks.length === 0) return null;

            const cfg = STAGE_CONFIG[stageKey];
            const stageCompleted = stageTasks.filter(t => t.completed).length;

            return (
              <div
                key={stageKey}
                className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden"
              >
                {/* Stage Section Header */}
                <div className="p-3.5 sm:p-4 bg-[#FAF7F0]/80 border-b border-[#E8E1D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#392538] text-[#C5A46D] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg">{cfg.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-sm sm:text-base font-bold text-[#392538]">
                          {cfg.label}
                        </h3>
                        <span className="text-[10px] font-bold text-[#755a2a] bg-white border border-[#E8E1D5] px-2 py-0.5 rounded-full">
                          {cfg.timeline}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4C454A] mt-0.5">{cfg.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="text-[11px] font-semibold text-[#4C454A]">
                      {stageCompleted} of {stageTasks.length} done
                    </span>
                    <div className="w-16 bg-[#ECE6DA] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#C5A46D] h-full rounded-full transition-all"
                        style={{
                          width: `${stageTasks.length > 0 ? (stageCompleted / stageTasks.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Task Cards in this Stage */}
                <div className="divide-y divide-[#E8E1D5]">
                  {stageTasks.map(task => renderTaskCard(task))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // FLAT LIST VIEW OR FILTERED STAGE VIEW
        <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden divide-y divide-[#E8E1D5]">
          {filteredTasks.map(task => renderTaskCard(task))}
        </div>
      )}

      {/* =========================================================================
           ADD / EDIT TASK MODAL
      ========================================================================= */}
      {(isAddModalOpen || editingTask) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#392538]/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#E8E1D5] my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#392538]">
                  {editingTask ? 'Edit Celebration Task' : 'Add Realistic Celebration Task'}
                </h3>
                <p className="text-xs text-[#4C454A]">
                  Enter specific actions for {celebrationName}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTask(null);
                }}
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

            <form onSubmit={handleSaveTask} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Order the birthday cake and confirm delivery time"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A46D]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">
                  What needs to be done (Explanation)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="e.g. Choose bakery, select flavor, confirm custom message and candles."
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A46D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">
                    Event Stage *
                  </label>
                  <select
                    value={formStage}
                    onChange={e => handleStageChange(e.target.value as TaskStage)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] focus:bg-white"
                  >
                    <option value="planning">Planning (2–3 weeks before)</option>
                    <option value="one-week-before">1 Week Before</option>
                    <option value="one-day-before">1 Day Before</option>
                    <option value="event-day">Celebration Day</option>
                    <option value="after-event">After the Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">
                    Suggested Deadline
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] focus:bg-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] focus:bg-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Assignee</label>
                  <input
                    type="text"
                    value={formAssignee}
                    onChange={e => setFormAssignee(e.target.value)}
                    placeholder="e.g. Aarav, Meera"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">
                  Private Notes &amp; Phone Numbers (Optional)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Bakery phone: +91 98200 12345, Order #BK-492"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D5]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#F4EFE6] text-[#392538] hover:bg-[#ECE6DA] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#392538] text-white font-semibold hover:bg-[#231123] shadow-xs"
                >
                  {editingTask ? 'Save Changes' : 'Add Task to Checklist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
           NOTES VIEWER MODAL
      ========================================================================= */}
      {notesModalTask && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392538]/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-[#E8E1D5]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5] mb-3">
              <h4 className="font-serif text-base font-bold text-[#392538]">
                Task Notes
              </h4>
              <button
                onClick={() => setNotesModalTask(null)}
                className="p-1 rounded-lg text-[#4C454A] hover:bg-[#F4EFE6]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <p className="text-xs font-semibold text-[#392538] mb-1">{notesModalTask.title}</p>
            <div className="p-3 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-xs text-[#4C454A] whitespace-pre-wrap">
              {notesModalTask.notes || 'No extra notes recorded.'}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setNotesModalTask(null)}
                className="px-4 py-1.5 rounded-lg bg-[#392538] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
           CONFIRMATION DELETE MODAL
      ========================================================================= */}
      <ConfirmationModal
        isOpen={!!taskToDelete}
        title="Delete Checklist Task"
        message={`Are you sure you want to delete the task "${taskToDelete?.title}"?`}
        confirmLabel="Delete Task"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
