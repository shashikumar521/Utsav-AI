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

export type PriceVerificationStatus = 'published' | 'vendor_confirmed' | 'user_provided' | 'estimated';
export type PricingUnit = 'per_guest' | 'per_hour' | 'per_day' | 'per_event' | 'fixed' | 'quantity';

export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  name: string;
  planned: number;
  actual: number;
  status: PaymentStatus;
  notes?: string;
  // Real-world evidence & calculation fields
  unit?: PricingUnit;
  unitPrice?: number;
  quantity?: number;
  verificationStatus?: PriceVerificationStatus;
  providerName?: string;
  sourceUrl?: string;
  verifiedDate?: string;
  isSecurityDeposit?: boolean;
  refundableDeposit?: number;
  venueId?: string;
}

export type TaskPriority = 'high' | 'medium' | 'low' | 'High' | 'Medium' | 'Low';

export type TaskStage =
  | 'planning'
  | 'one-week-before'
  | 'one-day-before'
  | 'event-day'
  | 'after-event';

export interface TaskItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  category: string;
  priority: TaskPriority;
  dueDate: string;
  stage?: TaskStage | string;
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
  | 'venues'
  | 'timeline'
  | 'moodboard'
  | 'guests-vendors'
  | 'guests'
  | 'ai-assistant'
  | 'settings';

export type VenueType =
  | 'function_hall'
  | 'banquet_hall'
  | 'convention_center'
  | 'hotel'
  | 'restaurant'
  | 'outdoor'
  | 'home'
  | 'other';

export interface VenueItem {
  id: string;
  name: string;
  category: VenueType;
  categoryLabel: string;
  city: string;
  locality: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
  capacityMin?: number;
  capacityMax?: number;
  rentalPrice?: number; // Base or flat daily rental in currency
  pricePerPerson?: number; // Food/per plate price
  pricingUnit: PricingUnit;
  currency: string;
  priceVerification: PriceVerificationStatus;
  isPricePublished: boolean;
  website?: string;
  phone?: string;
  amenities: string[];
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  cateringPolicy: 'in_house_only' | 'external_allowed' | 'both';
  sourceName: string;
  sourceUrl?: string;
  lastVerifiedDate: string;
  imageUrl?: string;
  description?: string;
  isVerified?: boolean;
}

export type DecorStyle = 'simple' | 'standard' | 'premium' | 'luxury';
export type FoodPreference = 'vegetarian' | 'non_vegetarian' | 'both';

export interface BudgetEstimatorInput {
  eventType: string;
  city: string;
  locality: string;
  eventDate: string;
  guestCount: number;
  venueType: VenueType;
  foodPreference: FoodPreference;
  decorStyle: DecorStyle;
  requiredServices: string[]; // ['catering', 'decoration', 'photography', 'entertainment', 'invitations', 'transportation', 'security_deposit']
  selectedVenueId?: string;
}

export interface BudgetBreakdownLine {
  category: BudgetCategory;
  name: string;
  formula: string;
  planned: number;
  unit: PricingUnit;
  unitPrice: number;
  quantity: number;
  verificationStatus: PriceVerificationStatus;
  providerName: string;
  sourceUrl?: string;
  verifiedDate: string;
  isSecurityDeposit?: boolean;
  notes?: string;
}

export interface BudgetEstimateBreakdown {
  tier: DecorStyle;
  tierLabel: string;
  city: string;
  guestCount: number;
  items: BudgetBreakdownLine[];
  operatingSubtotal: number;
  estimatedTaxes: number;
  contingencyAllowance: number;
  refundableSecurityDeposit: number; // Disclosed separately as refundable cash requirement
  totalEstimatedExpense: number;
  totalCashRequired: number; // Operating expense + security deposit
  lowEstimate: number;
  highEstimate: number;
  explanation: string;
}
