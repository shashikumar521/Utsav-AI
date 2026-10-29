import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EventItem,
  BudgetItem,
  TaskItem,
  GuestItem,
  VendorItem,
  MoodboardItem,
  ActiveTab,
  VenueItem,
  BudgetEstimateBreakdown,
} from '../types';
import {
  initialEvents,
  initialBudgetItems,
  initialTasks,
  initialGuests,
  initialVendors,
  initialMoodboards,
} from '../data/initialData';
import { generateEventSpecificTasks, calculateRealisticDueDate } from '../utils/taskGenerator';
import { buildVenueBudgetItems } from '../utils/budgetEngine';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface EventContextType {
  events: EventItem[];
  activeEvent: EventItem | undefined;
  currentEvent: EventItem | undefined; // alias for activeEvent
  activeEventId: string;
  currentEventId: string; // alias for activeEventId
  setActiveEventId: (id: string) => void;
  setCurrentEventId: (id: string) => void;
  createEvent: (data: any) => string;
  updateEvent: (id: string, partial: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  
  // Navigation
  activeTab: ActiveTab | string;
  setActiveTab: (tab: any) => void;

  // Budget
  budgetItems: BudgetItem[];
  addBudgetItem: (item: any) => void;
  updateBudgetItem: (id: string, partial: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  totalBudget: number;
  actualSpent: number;
  remainingBudget: number;
  applyBudgetEstimate: (estimate: BudgetEstimateBreakdown) => void;
  connectVenueToEvent: (venue: VenueItem) => void;

  // Venues
  savedVenues: VenueItem[];
  saveVenue: (venue: VenueItem) => void;
  removeSavedVenue: (venueId: string) => void;

  // Tasks
  tasks: TaskItem[];
  addTask: (task: any) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, partial: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  totalTasks: number;
  completedTasks: number;
  taskCompletionPercentage: number;
  generateTasksForEvent: (eventId?: string) => Promise<number>;
  updateTaskDeadlinesForEvent: (eventId: string, newDate: string) => void;

  // Guests
  guests: GuestItem[];
  addGuest: (guest: any) => void;
  updateGuest: (id: string, partial: Partial<GuestItem>) => void;
  deleteGuest: (id: string) => void;
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;

  // Vendors
  vendors: VendorItem[];
  addVendor: (vendor: any) => void;
  updateVendor: (id: string, partial: Partial<VendorItem>) => void;
  deleteVendor: (id: string) => void;

  // Moodboard
  moodboards: MoodboardItem[];
  addMoodboardItem: (item: any) => void;
  deleteMoodboardItem: (id: string) => void;

  // Global & Metrics
  daysRemaining: number;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
  resetToDemoData: () => void;
  resetToInitialData: () => void; // alias

  // Toast notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab | string>('overview');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Local storage initialization
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem('utsav_ai_events');
      if (saved) return JSON.parse(saved);
      return initialEvents.map(e => ({
        ...e,
        title: e.title || e.name,
        eventType: e.eventType || e.type,
        city: e.city || e.location,
        totalBudget: e.totalBudget || e.budget
      }));
    } catch {
      return initialEvents;
    }
  });

  const [activeEventId, setActiveEventIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('utsav_ai_active_id');
      return saved && events.some(e => e.id === saved) ? saved : events[0]?.id || 'evt-sunset-wedding';
    } catch {
      return events[0]?.id || 'evt-sunset-wedding';
    }
  });

  const [allBudget, setAllBudget] = useState<BudgetItem[]>(() => {
    try {
      const saved = localStorage.getItem('utsav_ai_budget');
      return saved ? JSON.parse(saved) : initialBudgetItems;
    } catch {
      return initialBudgetItems;
    }
  });

  const [allTasks, setAllTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('utsav_ai_tasks');
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [allGuests, setAllGuests] = useState<GuestItem[]>(() => {
    try {
      const saved = localStorage.getItem('utsav_ai_guests');
      return saved ? JSON.parse(saved) : initialGuests;
    } catch {
      return initialGuests;
    }
  });

  const [allVendors, setAllVendors] = useState<VendorItem[]>(() => {
    try {
      const saved = localStorage.getItem('utsav_ai_vendors');
      return saved ? JSON.parse(saved) : initialVendors;
    } catch {
      return initialVendors;
    }
  });

  const [allMoodboards, setAllMoodboards] = useState<MoodboardItem[]>(() => {
    try {
      const saved = localStorage.getItem('utsav_ai_moodboards');
      return saved ? JSON.parse(saved) : initialMoodboards;
    } catch {
      return initialMoodboards;
    }
  });

  const [allSavedVenues, setAllSavedVenues] = useState<VenueItem[]>(() => {
    try {
      const saved = localStorage.getItem('utsav_ai_saved_venues');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>('INR');

  // Persistence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('utsav_ai_events', JSON.stringify(events));
      localStorage.setItem('utsav_ai_active_id', activeEventId);
      localStorage.setItem('utsav_ai_budget', JSON.stringify(allBudget));
      localStorage.setItem('utsav_ai_tasks', JSON.stringify(allTasks));
      localStorage.setItem('utsav_ai_guests', JSON.stringify(allGuests));
      localStorage.setItem('utsav_ai_vendors', JSON.stringify(allVendors));
      localStorage.setItem('utsav_ai_moodboards', JSON.stringify(allMoodboards));
      localStorage.setItem('utsav_ai_saved_venues', JSON.stringify(allSavedVenues));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [events, activeEventId, allBudget, allTasks, allGuests, allVendors, allMoodboards, allSavedVenues]);

  const rawActiveEvent = events.find(e => e.id === activeEventId) || events[0];
  
  // Normalize activeEvent so that both name/title, location/city, budget/totalBudget exist
  const activeEvent: EventItem | undefined = rawActiveEvent ? {
    ...rawActiveEvent,
    title: rawActiveEvent.title || rawActiveEvent.name,
    name: rawActiveEvent.name || rawActiveEvent.title || 'Celebration',
    city: rawActiveEvent.city || rawActiveEvent.location,
    location: rawActiveEvent.location || rawActiveEvent.city || 'Gujarat, India',
    totalBudget: rawActiveEvent.totalBudget || rawActiveEvent.budget || 2500000,
    budget: rawActiveEvent.budget || rawActiveEvent.totalBudget || 2500000,
    eventType: rawActiveEvent.eventType || rawActiveEvent.type || 'Wedding',
    type: rawActiveEvent.type || rawActiveEvent.eventType || 'Wedding',
  } : undefined;

  const setActiveEventId = (id: string) => {
    setActiveEventIdState(id);
  };

  // Event CRUD
  const createEvent = (data: any): string => {
    const newId = `evt-${Date.now()}`;
    const nameVal = data.title || data.name || 'New Celebration';
    const locVal = data.city || data.location || 'Jaipur, India';
    const budgetVal = data.totalBudget || data.budget || 1500000;
    const typeVal = data.eventType || data.type || 'Wedding';

    const newEvent: EventItem = {
      id: newId,
      name: nameVal,
      title: nameVal,
      type: typeVal,
      eventType: typeVal,
      date: data.date,
      time: data.time || '18:00',
      location: locVal,
      city: locVal,
      venue: data.venue || `${locVal} Palace & Resort`,
      guestCount: data.guestCount || 200,
      budget: budgetVal,
      totalBudget: budgetVal,
      theme: data.theme || 'Royal Heritage',
      description: data.notes || data.description || 'Elegantly planned celebration with Utsav AI',
      status: 'Planning',
      notes: data.notes || '',
      palette: data.palette || ['#392538', '#FAF7F0', '#C5A46D', '#C97862', '#252321'],
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      createdAt: new Date().toISOString(),
    };

    setEvents(prev => [newEvent, ...prev]);
    setActiveEventIdState(newId);

    // Baseline budget items
    const defaultBudgets: BudgetItem[] = [
      { id: `b-${Date.now()}-1`, eventId: newId, category: 'Venue', name: 'Venue Rental & Decor Base', planned: Math.round(budgetVal * 0.25), actual: 0, status: 'Pending' },
      { id: `b-${Date.now()}-2`, eventId: newId, category: 'Catering', name: 'Royal Dining Banquet & Mocktails', planned: Math.round(budgetVal * 0.35), actual: 0, status: 'Pending' },
      { id: `b-${Date.now()}-3`, eventId: newId, category: 'Decoration', name: 'Floral Scenography & Mandap', planned: Math.round(budgetVal * 0.20), actual: 0, status: 'Pending' },
      { id: `b-${Date.now()}-4`, eventId: newId, category: 'Photography', name: 'Cinematic Visuals & Drone', planned: Math.round(budgetVal * 0.12), actual: 0, status: 'Pending' },
      { id: `b-${Date.now()}-5`, eventId: newId, category: 'Other', name: 'Unforeseen Contingency Reserve', planned: Math.round(budgetVal * 0.08), actual: 0, status: 'Pending' },
    ];
    setAllBudget(prev => [...defaultBudgets, ...prev]);

    // Generate realistic, event-specific checklist tasks based on celebration parameters
    const defaultTasks = generateEventSpecificTasks(newEvent);
    setAllTasks(prev => [...defaultTasks, ...prev]);

    showToast(`Created new celebration "${nameVal}" with ${defaultTasks.length} realistic tasks!`, 'success');
    return newId;
  };

  const updateEvent = (id: string, partial: Partial<EventItem>) => {
    setEvents(prev => prev.map(e => e.id === id ? { 
      ...e, 
      ...partial,
      name: partial.title || partial.name || e.name,
      title: partial.title || partial.name || e.title,
      location: partial.city || partial.location || e.location,
      city: partial.city || partial.location || e.city,
      budget: partial.totalBudget || partial.budget || e.budget,
      totalBudget: partial.totalBudget || partial.budget || e.totalBudget,
    } : e));
    if (partial.date) {
      updateTaskDeadlinesForEvent(id, partial.date);
    }
    showToast('Event dossier updated', 'success');
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => {
      const remaining = prev.filter(e => e.id !== id);
      if (activeEventId === id && remaining.length > 0) {
        setActiveEventIdState(remaining[0].id);
      }
      return remaining;
    });
    setAllBudget(prev => prev.filter(b => b.eventId !== id));
    setAllTasks(prev => prev.filter(t => t.eventId !== id));
    setAllGuests(prev => prev.filter(g => g.eventId !== id));
    setAllVendors(prev => prev.filter(v => v.eventId !== id));
    setAllMoodboards(prev => prev.filter(m => m.eventId !== id));
    showToast('Celebration archived', 'info');
  };

  // Filtered lists for active event
  const currentEventId = activeEvent?.id || '';
  const budgetItems = allBudget.filter(b => b.eventId === currentEventId);
  const tasks = allTasks.filter(t => t.eventId === currentEventId);
  const guests = allGuests.filter(g => g.eventId === currentEventId);
  const vendors = allVendors.filter(v => v.eventId === currentEventId);
  const moodboards = allMoodboards.filter(m => m.eventId === currentEventId);

  // Budget calculations
  const totalBudget = activeEvent?.totalBudget || activeEvent?.budget || 0;
  const actualSpent = budgetItems.reduce((acc, curr) => acc + (Number(curr.actual) || 0), 0);
  const remainingBudget = Math.max(0, totalBudget - actualSpent);

  // Task calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Guest calculations
  const totalGuests = guests.reduce((acc, curr) => acc + (curr.partySize || (1 + (curr.plusOnes || 0))), 0);
  const confirmedGuests = guests.filter(g => g.rsvp === 'confirmed' || g.rsvpStatus === 'Confirmed')
    .reduce((acc, curr) => acc + (curr.partySize || (1 + (curr.plusOnes || 0))), 0);
  const pendingGuests = guests.filter(g => g.rsvp === 'pending' || g.rsvpStatus === 'Pending')
    .reduce((acc, curr) => acc + (curr.partySize || (1 + (curr.plusOnes || 0))), 0);
  const declinedGuests = guests.filter(g => g.rsvp === 'declined' || g.rsvpStatus === 'Declined')
    .reduce((acc, curr) => acc + (curr.partySize || (1 + (curr.plusOnes || 0))), 0);

  // Days remaining calculation
  const calculateDaysRemaining = (): number => {
    if (!activeEvent?.date) return 0;
    try {
      const target = new Date(activeEvent.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch {
      return 18;
    }
  };
  const daysRemaining = calculateDaysRemaining();

  // Budget CRUD
  const addBudgetItem = (item: any) => {
    if (!currentEventId) return;
    const newItem: BudgetItem = {
      ...item,
      id: `b-${Date.now()}`,
      eventId: currentEventId,
    };
    setAllBudget(prev => [newItem, ...prev]);
    showToast('Budget allocation recorded', 'success');
  };

  const updateBudgetItem = (id: string, partial: Partial<BudgetItem>) => {
    setAllBudget(prev => prev.map(b => b.id === id ? { ...b, ...partial } : b));
    showToast('Budget item updated', 'success');
  };

  const deleteBudgetItem = (id: string) => {
    setAllBudget(prev => prev.filter(b => b.id !== id));
    showToast('Budget line removed', 'info');
  };

  const applyBudgetEstimate = (estimate: BudgetEstimateBreakdown) => {
    if (!activeEvent) return;
    const eventId = activeEvent.id;

    // Update event total planned budget
    updateEvent(eventId, {
      budget: estimate.totalEstimatedExpense,
      totalBudget: estimate.totalEstimatedExpense,
    });

    // Convert breakdown lines to verified BudgetItem list
    const newBudgetItems: BudgetItem[] = estimate.items.map((line, idx) => ({
      id: `b-est-${Date.now()}-${idx}`,
      eventId,
      category: line.category,
      name: line.name,
      planned: line.planned,
      actual: 0,
      status: 'Pending',
      unit: line.unit,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      verificationStatus: line.verificationStatus,
      providerName: line.providerName,
      sourceUrl: line.sourceUrl,
      verifiedDate: line.verifiedDate,
      isSecurityDeposit: line.isSecurityDeposit,
      notes: line.formula ? `${line.formula} · ${line.notes || ''}` : line.notes,
    }));

    // Add security deposit as separate line if present
    if (estimate.refundableSecurityDeposit > 0) {
      newBudgetItems.push({
        id: `b-est-dep-${Date.now()}`,
        eventId,
        category: 'Venue',
        name: `Refundable Venue Security Deposit (${estimate.city})`,
        planned: estimate.refundableSecurityDeposit,
        actual: 0,
        status: 'Pending',
        unit: 'per_event',
        unitPrice: estimate.refundableSecurityDeposit,
        quantity: 1,
        verificationStatus: 'published',
        providerName: 'Venue Management Tariff',
        isSecurityDeposit: true,
        refundableDeposit: estimate.refundableSecurityDeposit,
        notes: '100% refundable after event teardown and hall clearance inspection. Excluded from operating expense subtotals.',
      });
    }

    // Replace budget lines for this event with newly estimated itemized breakdown
    setAllBudget(prev => [
      ...newBudgetItems,
      ...prev.filter(b => b.eventId !== eventId),
    ]);

    showToast(`Applied ${estimate.tierLabel} budget (₹${estimate.totalEstimatedExpense.toLocaleString('en-IN')}) with ${newBudgetItems.length} verified lines!`, 'success');
  };

  const connectVenueToEvent = (venue: VenueItem) => {
    if (!activeEvent) return;
    const eventId = activeEvent.id;

    // Update activeEvent's venue name, city, and location
    updateEvent(eventId, {
      venue: venue.name,
      location: `${venue.locality}, ${venue.city}`,
      city: venue.city,
    });

    // Build realistic budget items for this venue
    const newItems = buildVenueBudgetItems(venue, eventId, activeEvent.guestCount || 100);

    // Remove any previously connected venue line for this event to avoid duplicate entries
    setAllBudget(prev => {
      const filtered = prev.filter(b => b.eventId !== eventId || (!b.venueId && b.category !== 'Venue'));
      return [...newItems, ...filtered];
    });

    showToast(`Connected "${venue.name}" to celebration! Added ${newItems.length} verified budget line(s).`, 'success');
  };

  const saveVenue = (venue: VenueItem) => {
    setAllSavedVenues(prev => {
      if (prev.some(v => v.id === venue.id)) return prev;
      return [venue, ...prev];
    });
    showToast(`Saved "${venue.name}" to shortlist`, 'success');
  };

  const removeSavedVenue = (venueId: string) => {
    setAllSavedVenues(prev => prev.filter(v => v.id !== venueId));
    showToast('Venue removed from shortlist', 'info');
  };

  // Tasks CRUD
  const addTask = (task: any) => {
    if (!currentEventId) return;
    const newTask: TaskItem = {
      ...task,
      priority: task.priority || 'medium',
      completed: false,
      assignee: task.assignedTo || task.assignee || 'Host Council',
      id: `t-${Date.now()}`,
      eventId: currentEventId,
    };
    setAllTasks(prev => [newTask, ...prev]);
    showToast('New task added to checklist', 'success');
  };

  const toggleTask = (id: string) => {
    setAllTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updateTask = (id: string, partial: Partial<TaskItem>) => {
    setAllTasks(prev => prev.map(t => t.id === id ? { ...t, ...partial } : t));
    showToast('Task updated', 'success');
  };

  const deleteTask = (id: string) => {
    setAllTasks(prev => prev.filter(t => t.id !== id));
    showToast('Task deleted', 'info');
  };

  const generateTasksForEvent = async (targetEventId?: string): Promise<number> => {
    const evtId = targetEventId || currentEventId;
    const targetEvt = events.find(e => e.id === evtId) || activeEvent;
    if (!targetEvt) return 0;

    let newTasks: TaskItem[] = [];

    // Attempt AI generation via /api/ai/generate-tasks
    try {
      const response = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: targetEvt.eventType || targetEvt.type,
          title: targetEvt.title || targetEvt.name,
          date: targetEvt.date,
          guestCount: targetEvt.guestCount,
          budget: targetEvt.budget || targetEvt.totalBudget,
          venue: targetEvt.venue,
          location: targetEvt.location || targetEvt.city,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          const existingSet = new Set(
            allTasks.filter(t => t.eventId === evtId).map(t => t.title.toLowerCase().trim())
          );
          newTasks = data.tasks
            .filter((t: any) => !existingSet.has((t.title || '').toLowerCase().trim()))
            .map((t: any, idx: number) => ({
              id: `task-ai-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
              eventId: evtId,
              title: t.title,
              description: t.description || '',
              category: t.category || 'General',
              priority: (t.priority || 'medium').toLowerCase(),
              dueDate: t.dueDate || targetEvt.date,
              stage: t.stage || 'planning',
              completed: false,
              assignee: 'Host Council',
              notes: t.description || '',
            }));
        }
      }
    } catch (e) {
      console.warn('AI task generation error, falling back to local realistic templates:', e);
    }

    // Fallback or complement with local template generator
    if (newTasks.length === 0) {
      newTasks = generateEventSpecificTasks(targetEvt, allTasks);
    }

    if (newTasks.length > 0) {
      setAllTasks(prev => [...newTasks, ...prev]);
      showToast(`Added ${newTasks.length} realistic tasks for ${targetEvt.title || targetEvt.name}!`, 'success');
    } else {
      showToast('All recommended tasks for this celebration are already on your checklist.', 'info');
    }

    return newTasks.length;
  };

  const updateTaskDeadlinesForEvent = (eventId: string, newDate: string) => {
    const targetEvt = events.find(e => e.id === eventId);
    if (!targetEvt || !newDate) return;

    const stageDaysMap: Record<string, number> = {
      'planning': 18,
      'one-week-before': 7,
      'one-day-before': 1,
      'event-day': 0,
      'after-event': -1,
    };

    setAllTasks(prev => prev.map(t => {
      if (t.eventId !== eventId || t.completed) return t;
      const stage = (t.stage as string) || 'planning';
      const suggestedDays = stageDaysMap[stage] ?? 7;
      const newDueDate = calculateRealisticDueDate(newDate, suggestedDays);
      return {
        ...t,
        dueDate: newDueDate,
      };
    }));

    showToast(`Task deadlines adjusted to match the event date (${newDate})`, 'success');
  };

  // Guests CRUD
  const addGuest = (guest: any) => {
    if (!currentEventId) return;
    const partyCount = (guest.plusOnes || 0) + 1;
    const newGuest: GuestItem = {
      ...guest,
      partySize: partyCount,
      rsvp: (guest.rsvpStatus?.toLowerCase() || 'pending') as any,
      rsvpStatus: guest.rsvpStatus || 'Pending',
      id: `g-${Date.now()}`,
      eventId: currentEventId,
    };
    setAllGuests(prev => [newGuest, ...prev]);
    showToast(`Added ${guest.name} to RSVP list`, 'success');
  };

  const updateGuest = (id: string, partial: Partial<GuestItem>) => {
    setAllGuests(prev => prev.map(g => g.id === id ? { 
      ...g, 
      ...partial,
      partySize: partial.plusOnes !== undefined ? (partial.plusOnes + 1) : g.partySize,
      rsvp: (partial.rsvpStatus?.toLowerCase() || g.rsvp) as any,
    } : g));
    showToast('Guest record updated', 'success');
  };

  const deleteGuest = (id: string) => {
    setAllGuests(prev => prev.filter(g => g.id !== id));
    showToast('Guest removed', 'info');
  };

  // Vendors CRUD
  const addVendor = (vendor: any) => {
    if (!currentEventId) return;
    const newVendor: VendorItem = {
      ...vendor,
      estimatedCost: vendor.priceQuote || vendor.estimatedCost || 0,
      priceQuote: vendor.priceQuote || vendor.estimatedCost || 0,
      paidAmount: vendor.paidAmount || 0,
      id: `v-${Date.now()}`,
      eventId: currentEventId,
    };
    setAllVendors(prev => [newVendor, ...prev]);
    showToast(`Added ${vendor.name} to vendor roster`, 'success');
  };

  const updateVendor = (id: string, partial: Partial<VendorItem>) => {
    setAllVendors(prev => prev.map(v => v.id === id ? { 
      ...v, 
      ...partial,
      estimatedCost: partial.priceQuote !== undefined ? partial.priceQuote : v.estimatedCost,
    } : v));
    showToast('Vendor record updated', 'success');
  };

  const deleteVendor = (id: string) => {
    setAllVendors(prev => prev.filter(v => v.id !== id));
    showToast('Vendor removed from roster', 'info');
  };

  // Moodboard CRUD
  const addMoodboardItem = (item: any) => {
    if (!currentEventId) return;
    const newItem: MoodboardItem = {
      ...item,
      id: `mb-${Date.now()}`,
      eventId: currentEventId,
    };
    setAllMoodboards(prev => [newItem, ...prev]);
    showToast('Moodboard card created', 'success');
  };

  const deleteMoodboardItem = (id: string) => {
    setAllMoodboards(prev => prev.filter(m => m.id !== id));
    showToast('Moodboard card removed', 'info');
  };

  const resetToDemoData = () => {
    setEvents(initialEvents);
    setActiveEventIdState('evt-sunset-wedding');
    setAllBudget(initialBudgetItems);
    setAllTasks(initialTasks);
    setAllGuests(initialGuests);
    setAllVendors(initialVendors);
    setAllMoodboards(initialMoodboards);
    try {
      localStorage.removeItem('utsav_ai_events');
      localStorage.removeItem('utsav_ai_active_id');
      localStorage.removeItem('utsav_ai_budget');
      localStorage.removeItem('utsav_ai_tasks');
      localStorage.removeItem('utsav_ai_guests');
      localStorage.removeItem('utsav_ai_vendors');
      localStorage.removeItem('utsav_ai_moodboards');
    } catch {}
    showToast('Sample celebration archive restored', 'info');
  };

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
  };

  const formatCurrency = (amount: number): string => {
    const num = Number(amount) || 0;
    if (currency === 'USD') {
      return `$${Math.round(num / 85).toLocaleString('en-US')}`;
    }
    if (currency === 'EUR') {
      return `€${Math.round(num / 92).toLocaleString('en-US')}`;
    }
    if (currency === 'GBP') {
      return `£${Math.round(num / 108).toLocaleString('en-US')}`;
    }
    if (currency === 'AED') {
      return `AED ${Math.round(num / 23).toLocaleString('en-US')}`;
    }
    // Default INR (Indian numbering format)
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        currentEvent: activeEvent,
        activeEventId,
        currentEventId: activeEventId,
        setActiveEventId,
        setCurrentEventId: setActiveEventId,
        createEvent,
        updateEvent,
        deleteEvent,
        activeTab,
        setActiveTab,
        budgetItems,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        totalBudget,
        actualSpent,
        remainingBudget,
        applyBudgetEstimate,
        connectVenueToEvent,
        savedVenues: allSavedVenues,
        saveVenue,
        removeSavedVenue,
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
        guests,
        addGuest,
        updateGuest,
        deleteGuest,
        totalGuests,
        confirmedGuests,
        pendingGuests,
        declinedGuests,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        moodboards,
        addMoodboardItem,
        deleteMoodboardItem,
        daysRemaining,
        currency,
        setCurrency,
        formatCurrency,
        resetToDemoData,
        resetToInitialData: resetToDemoData,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
