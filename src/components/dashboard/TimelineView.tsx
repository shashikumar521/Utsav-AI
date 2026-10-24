import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { TaskItem, TaskPriority } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface TimelineViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

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
  } = useEvents();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Logistics');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAssignee, setFormAssignee] = useState('');
  const [formError, setFormError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredTasks = tasks.filter(t => {
    if (statusFilter === 'pending' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const overdueTasksCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length;

  const openAddModal = () => {
    setFormTitle('');
    setFormCategory('Logistics');
    setFormPriority('medium');
    setFormDueDate(activeEvent?.date || today);
    setFormAssignee('Lead Coordinator');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormCategory(task.category);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate);
    setFormAssignee(task.assignee || '');
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
        category: formCategory,
        priority: formPriority,
        dueDate: formDueDate,
        assignee: formAssignee.trim() || undefined,
      });
      onShowToast(`Updated task "${formTitle}"`, 'success');
      setEditingTask(null);
    } else {
      addTask({
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        dueDate: formDueDate || today,
        completed: false,
        assignee: formAssignee.trim() || undefined,
      });
      onShowToast(`Added task "${formTitle}"`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    onShowToast(`Deleted task "${taskToDelete.title}"`, 'info');
    setTaskToDelete(null);
  };

  const handleGenerateChecklist = () => {
    const eventType = activeEvent?.type || 'Celebration';
    const newItems = [
      { title: `Schedule walkthrough with ${eventType} venue director`, category: 'Venue', priority: 'high' as const, dueDate: activeEvent?.date || today, completed: false, assignee: 'Host' },
      { title: 'Confirm arrival time and sound test with acoustic artists', category: 'Entertainment', priority: 'medium' as const, dueDate: activeEvent?.date || today, completed: false, assignee: 'Sound Lead' },
      { title: 'Prepare cash envelopes for vendor day-of gratuities', category: 'Logistics', priority: 'low' as const, dueDate: activeEvent?.date || today, completed: false, assignee: 'Priya' },
      { title: 'Design photo group queue order for VIP family members', category: 'Photography', priority: 'medium' as const, dueDate: activeEvent?.date || today, completed: false, assignee: 'Coordinator' },
    ];

    newItems.forEach(item => addTask(item));
    onShowToast(`Generated ${newItems.length} curated checklist items for ${eventType}`, 'success');
  };

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* Header & Progress Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
              Logistical Blueprint
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#392538]">
              Celebration Timeline &amp; Task Master
            </h2>
            <p className="text-xs text-[#4C454A] mt-0.5">
              Run-of-show choreography for {activeEvent?.name}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleGenerateChecklist}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F4EFE6] text-[#392538] hover:bg-[#ECE6DA] text-xs font-semibold transition"
              title="Add suggested checklist for event type"
            >
              <span className="material-symbols-outlined text-sm text-[#755a2a]">auto_fix_high</span>
              <span>Generate Checklist</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#392538] text-white text-xs font-semibold hover:bg-[#231123] transition shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-[#C5A46D]">add</span>
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E8E1D5]">
          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Total Milestones
            </span>
            <p className="font-serif text-xl font-bold text-[#392538] mt-0.5">
              {totalTasks}
            </p>
            <span className="text-[11px] text-[#4C454A]">
              {completedTasks} completed ({taskCompletionPercentage}%)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Pending Checkpoints
            </span>
            <p className="font-serif text-xl font-bold text-[#C97862] mt-0.5">
              {totalTasks - completedTasks}
            </p>
            <span className="text-[11px] text-[#4C454A]">Active coordination in progress</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Overdue Status
            </span>
            <p className={`font-serif text-xl font-bold mt-0.5 ${overdueTasksCount > 0 ? 'text-red-600' : 'text-[#4A6B53]'}`}>
              {overdueTasksCount} Overdue
            </p>
            <span className="text-[11px] text-[#4C454A]">
              {overdueTasksCount > 0 ? 'Immediate resolution required' : 'On schedule'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between items-center text-xs text-[#4C454A]">
            <span>Milestone Completion</span>
            <span className="font-semibold text-[#392538]">
              {completedTasks} of {totalTasks} milestones completed ({taskCompletionPercentage}%)
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

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#E8E1D5] shadow-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-[#392538] text-white'
                : 'text-[#4C454A] hover:bg-[#F4EFE6]'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'pending'
                ? 'bg-[#392538] text-white'
                : 'text-[#4C454A] hover:bg-[#F4EFE6]'
            }`}
          >
            Pending ({tasks.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'completed'
                ? 'bg-[#392538] text-white'
                : 'text-[#4C454A] hover:bg-[#F4EFE6]'
            }`}
          >
            Completed ({completedTasks})
          </button>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 text-xs text-[#4C454A]">
          <span className="text-[10px] uppercase font-bold text-[#755a2a]">Priority:</span>
          {(['all', 'high', 'medium', 'low'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                priorityFilter === p
                  ? 'bg-[#F4EFE6] text-[#392538] font-bold border border-[#C5A46D]'
                  : 'hover:bg-[#FAF7F0] text-[#4C454A]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task Items List */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden flex flex-col divide-y divide-[#E8E1D5]">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const isOverdue = !task.completed && task.dueDate && task.dueDate < today;

            return (
              <div
                key={task.id}
                className="p-4 hover:bg-[#FAF7F0]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
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
                    className="mt-1 w-4 h-4 rounded text-[#392538] focus:ring-[#C5A46D] cursor-pointer shrink-0"
                    id={`task-item-${task.id}`}
                  />
                  <div className="flex flex-col min-w-0">
                    <label
                      htmlFor={`task-item-${task.id}`}
                      className={`text-sm font-semibold text-[#392538] cursor-pointer ${
                        task.completed ? 'line-through opacity-50' : ''
                      }`}
                    >
                      {task.title}
                    </label>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#4C454A]">
                      <span className="font-medium text-[#755a2a]">{task.category}</span>
                      <span>·</span>
                      <span
                        className={`font-semibold ${
                          isOverdue ? 'text-red-600 font-bold' : ''
                        }`}
                      >
                        {isOverdue ? '⚠️ Overdue: ' : 'Due: '}
                        {task.dueDate}
                      </span>
                      {task.assignee && (
                        <>
                          <span>·</span>
                          <span>Assignee: {task.assignee}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  {/* Priority Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      task.priority === 'high'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : task.priority === 'medium'
                        ? 'bg-[#C5A46D]/15 text-[#755a2a] border border-[#C5A46D]/30'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.priority} Priority
                  </span>

                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1 rounded text-[#4C454A] hover:text-[#392538] hover:bg-[#F4EFE6]"
                    title="Edit task"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="p-1 rounded text-[#4C454A] hover:text-red-600 hover:bg-red-50"
                    title="Delete task"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-[#4C454A]">
            No milestones match current filters. Click "Add Task" to create a new deadline.
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {(isAddModalOpen || editingTask) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#392538]/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#E8E1D5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-4">
              <h3 className="font-serif text-lg font-bold text-[#392538]">
                {editingTask ? 'Edit Milestone Task' : 'Add Milestone Checkpoint'}
              </h3>
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

            <form onSubmit={handleSaveTask} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Task Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Taste test wedding farsan menu"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decoration">Decoration</option>
                    <option value="Photography">Photography</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Invitations">Invitations</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Lead Assignee</label>
                  <input
                    type="text"
                    value={formAssignee}
                    onChange={e => setFormAssignee(e.target.value)}
                    placeholder="e.g. Lead Coordinator, Chef"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  />
                </div>
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
                  className="px-5 py-2 rounded-lg bg-[#392538] text-white font-semibold hover:bg-[#231123]"
                >
                  {editingTask ? 'Save Changes' : 'Add Checkpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!taskToDelete}
        title="Delete Milestone Task"
        message={`Are you sure you want to delete the task "${taskToDelete?.title}"?`}
        confirmLabel="Delete Task"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
