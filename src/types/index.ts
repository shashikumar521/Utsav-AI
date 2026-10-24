export type EventType =
  | 'Wedding'
  | 'Milestone Birthday'
  | 'Anniversary'
  | 'Festival'
  | 'Festival / Diwali'
  | 'Corporate Gala'
  | 'Intimate Soirée'
  | 'Intimate Dinner'
  | 'Baby Shower'
  | 'Other';

export type PlanningStatus = 'Planning' | 'Confirmed' | 'Completed';

export interface EventItem {
  id: string;
  name: string;
  title?: string; // alias for name
  type: EventType;
  eventType?: EventType; // alias for type
  date: string;
  time?: string;
  location: string;
  city?: string; // alias for location
  venue?: string;
  guestCount: number;
  budget: number;
  totalBudget?: number; // alias for budget
  theme: string;
  description: string;
  status: PlanningStatus;
  notes?: string;
  palette: string[];
  coverImage?: string;
  createdAt: string;
}

export type BudgetCategory =
  | 'Venue'
  | 'Catering'
  | 'Decoration'
  | 'Decor'
  | 'Photography'
  | 'Entertainment'
  | 'Music & Entertainment'
  | 'Invitations'
  | 'Invitations & Favors'
  | 'Attire & Jewelry'
  | 'Hair & Makeup'
  | 'Transportation'
  | 'Other';

export type VendorCategory = BudgetCategory;

export type PaymentStatus = 'Pending' | 'Paid' | 'Deposit Paid';

export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  name: string;
  planned: number;
  actual: number;
  status: PaymentStatus;
  notes?: string;
}

export type TaskPriority = 'high' | 'medium' | 'low' | 'High' | 'Medium' | 'Low';

export interface TaskItem {
  id: string;
  eventId: string;
  title: string;
  category: string;
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
  assignee?: string;
  assignedTo?: string; // alias
  notes?: string;
}

export type RSVPStatus = 'confirmed' | 'pending' | 'declined' | 'Confirmed' | 'Pending' | 'Declined';
export type GuestGroup = 'Family' | 'Friends' | 'Colleagues' | 'VIP' | string;

export interface GuestItem {
  id: string;
  eventId: string;
  name: string;
  phone?: string;
  email?: string;
  rsvp?: RSVPStatus;
  rsvpStatus?: RSVPStatus;
  partySize?: number;
  plusOnes?: number;
  group: GuestGroup;
  dietary?: string;
  dietaryRestrictions?: string;
  tableAssignment?: string;
  notes?: string;
}

export type VendorBookingStatus = 'Inquiry' | 'Quoted' | 'Shortlisted' | 'Booked' | 'Completed' | 'Declined';

export interface VendorItem {
  id: string;
  eventId: string;
  name: string;
  category: BudgetCategory;
  contact?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  estimatedCost?: number;
  priceQuote?: number;
  paidAmount?: number;
  status: VendorBookingStatus;
  contractSigned?: boolean;
  rating?: number;
  notes?: string;
}

export interface MoodboardItem {
  id: string;
  eventId: string;
  title: string;
  category: 'Color Palette' | 'Floral & Decor' | 'Attire & Styling' | 'Lighting & Ambience' | 'Dining & Table' | string;
  imageUrl?: string;
  notes: string;
  paletteColors?: string[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedTasks?: { title: string; priority: TaskPriority; category: string }[];
  suggestedBudgets?: { category: BudgetCategory; name: string; amount: number }[];
  note?: string;
  timestamp: string;
}

export type ActiveTab =
  | 'landing'
  | 'overview'
  | 'events'
  | 'budget'
  | 'timeline'
  | 'moodboard'
  | 'guests-vendors'
  | 'guests'
  | 'ai-assistant'
  | 'settings';
