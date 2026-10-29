import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { EventItem, EventType, PlanningStatus } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface EventsViewProps {
  onOpenNewEventModal: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToOverview: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onOpenNewEventModal,
  onShowToast,
  onNavigateToOverview,
}) => {
  const {
    events,
    activeEventId,
    setActiveEventId,
    updateEvent,
    deleteEvent,
    formatCurrency,
  } = useEvents();

  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<EventType>('Wedding');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editGuests, setEditGuests] = useState(100);
  const [editBudget, setEditBudget] = useState(500000);
  const [editTheme, setEditTheme] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<PlanningStatus>('Planning');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState('');

  const openEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    setEditName(evt.name);
    setEditType(evt.type);
    setEditDate(evt.date);
    setEditTime(evt.time || '18:00');
    setEditLocation(evt.location);
    setEditGuests(evt.guestCount);
    setEditBudget(evt.budget);
    setEditTheme(evt.theme);
    setEditDescription(evt.description);
    setEditStatus(evt.status);
    setEditNotes(evt.notes || '');
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (!editName.trim() || !editDate || !editLocation.trim()) {
      setEditError('Name, date, and location are required.');
      return;
    }

    updateEvent(editingEvent.id, {
      name: editName.trim(),
      type: editType,
      date: editDate,
      time: editTime,
      location: editLocation.trim(),
      guestCount: Number(editGuests) || 50,
      budget: Number(editBudget) || 100000,
      theme: editTheme.trim(),
      description: editDescription.trim(),
      status: editStatus,
      notes: editNotes.trim(),
    });

    onShowToast(`Updated "${editName}"`, 'success');
    setEditingEvent(null);
  };

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    deleteEvent(eventToDelete.id);
    onShowToast(`Deleted "${eventToDelete.name}"`, 'info');
    setEventToDelete(null);
  };

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-[#E8E1D5] shadow-xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#392538]">
            My Events
          </h2>
          <p className="text-xs text-[#4C454A] mt-0.5">
            View and manage all your celebrations, or switch which event you are planning.
          </p>
        </div>

        <button
          onClick={onOpenNewEventModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#392538] text-white text-xs font-semibold hover:bg-[#231123] transition shadow-xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm text-[#C5A46D]">add</span>
          <span>Create Event</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => {
          const isActive = event.id === activeEventId;

          return (
            <div
              key={event.id}
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between gap-4 ${
                isActive
                  ? 'border-[#C5A46D] shadow-sm ring-1 ring-[#C5A46D]/30'
                  : 'border-[#E8E1D5] hover:border-[#DFD7C7]'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a] px-2 py-0.5 rounded bg-[#F4EFE6]">
                    {event.type}
                  </span>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4A6B53]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B53]" /> Active Event
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg font-bold text-[#392538] leading-tight">
                  {event.name}
                </h3>

                <p className="text-xs text-[#4C454A] line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-[#4C454A]">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#755a2a] block">
                      Target Date
                    </span>
                    <span className="font-semibold text-[#392538]">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#755a2a] block">
                      Guest Scale
                    </span>
                    <span className="font-semibold text-[#392538]">
                      {event.guestCount} Guests
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#755a2a] block">
                      Allocated Budget
                    </span>
                    <span className="font-semibold text-[#392538]">
                      {formatCurrency(event.budget)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#755a2a] block">
                      Location
                    </span>
                    <span className="font-semibold text-[#392538] truncate block" title={event.location}>
                      {event.location.split(',')[0]}
                    </span>
                  </div>
                </div>

                {/* Color Palette Preview Bar */}
                {event.palette && event.palette.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1 pt-2 border-t border-[#E8E1D5]">
                    <span className="text-[10px] text-[#4C454A]">Palette:</span>
                    <div className="flex items-center gap-1">
                      {event.palette.slice(0, 5).map((color, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(event)}
                    className="p-1.5 rounded-lg text-[#4C454A] hover:text-[#392538] hover:bg-[#F4EFE6] transition-colors"
                    title="Edit celebration details"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => setEventToDelete(event)}
                    className="p-1.5 rounded-lg text-[#4C454A] hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Delete celebration"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>

                {isActive ? (
                  <button
                    onClick={onNavigateToOverview}
                    className="px-3.5 py-1.5 rounded-lg bg-[#392538] text-white text-xs font-semibold hover:bg-[#231123] transition-colors"
                  >
                    Open Atelier →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveEventId(event.id);
                      onShowToast(`Switched active celebration to "${event.name}"`, 'success');
                      onNavigateToOverview();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#F4EFE6] text-[#392538] hover:bg-[#ECE6DA] text-xs font-semibold transition-colors"
                  >
                    Select &amp; Open
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#392538]/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-[#E8E1D5] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-4">
              <h3 className="font-serif text-lg font-bold text-[#392538]">
                Edit Celebration Parameters
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1 rounded-lg text-[#4C454A] hover:bg-[#F4EFE6]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {editError && (
              <div className="mb-3 p-2.5 rounded bg-red-50 text-red-700 text-xs font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 font-sans text-xs">
              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Celebration Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] focus:ring-1 focus:ring-[#C5A46D] text-[#392538]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Event Type</label>
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value as EventType)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Milestone Birthday">Milestone Birthday</option>
                    <option value="Festival">Festival</option>
                    <option value="Corporate Gala">Corporate Gala</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Intimate Soirée">Intimate Soirée</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Planning Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as PlanningStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Target Date *</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">City or Venue *</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Guest Scale</label>
                  <input
                    type="number"
                    min="5"
                    value={editGuests}
                    onChange={e => setEditGuests(parseInt(e.target.value, 10) || 10)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Total Budget (INR)</label>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    value={editBudget}
                    onChange={e => setEditBudget(parseInt(e.target.value, 10) || 10000)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Theme / Atmosphere</label>
                <input
                  type="text"
                  value={editTheme}
                  onChange={e => setEditTheme(e.target.value)}
                  placeholder="e.g. Heritage Brass & Sunset Marigold"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Description Brief</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Host Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Special dietary requests, vendor notes, rituals..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D5]">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-lg bg-[#F4EFE6] text-[#392538] hover:bg-[#ECE6DA] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#392538] text-white font-semibold hover:bg-[#231123]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={!!eventToDelete}
        title="Delete Celebration Dossier"
        message={`Are you sure you want to permanently delete "${eventToDelete?.name}"? All associated budget items, tasks, guests, vendors, and moodboard items will be removed.`}
        confirmLabel="Delete Celebration"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEventToDelete(null)}
      />
    </div>
  );
};
