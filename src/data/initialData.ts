import { EventItem, BudgetItem, TaskItem, GuestItem, VendorItem, MoodboardItem } from '../types';

export const initialEvents: EventItem[] = [
  {
    id: 'evt-sunset-wedding',
    name: "Ananya & Kabir’s Sunset Wedding",
    type: 'Wedding',
    date: '2025-11-14',
    time: '16:30',
    location: 'Ahmedabad, Gujarat',
    venue: 'Heritage Haveli Courtyard & Open Lawns',
    guestCount: 140,
    budget: 1000000,
    theme: 'Heritage Brass & Sunset Marigold',
    description: 'An intimate 2-day Gujarati sunset wedding for 140 guests, with traditional Kathiyawadi cuisine, floating candle ponds, velvet drapery, and acoustic sangeet night.',
    status: 'Planning',
    palette: ['#392538', '#C5A46D', '#C97862', '#FAF7F0', '#4A6B53'],
    notes: 'Bride prefers fragrant tuberoses, mogra and marigolds. Strict vegetarian feast with artisan farsan live counter. Sunset mandap ceremony starts 5:15 PM sharp.',
    createdAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'evt-milestone-birthday',
    name: "Aarav's 40th Milestone Evening",
    type: 'Milestone Birthday',
    date: '2025-12-05',
    time: '19:30',
    location: 'Udaipur, Rajasthan',
    venue: 'Lake Pichola Rooftop Pavilion',
    guestCount: 45,
    budget: 350000,
    theme: 'Champagne Monolith & Amber Velvet',
    description: 'A black-tie intimate gathering of close friends, featuring artisanal citrus cocktails, acoustic jazz trio, and a slow multi-course dinner under palace lights.',
    status: 'Planning',
    palette: ['#231123', '#C5A46D', '#ECE6DA', '#755A2A', '#FAF7F0'],
    notes: 'Live acoustic saxophonist booked. Dessert bar with customized chocolate truffles.',
    createdAt: '2025-09-15T14:30:00Z',
  }
];

export const initialBudgetItems: BudgetItem[] = [
  // Wedding items (total planned = 10,00,000, actual = 7,32,000, remaining = 2,68,000)
  {
    id: 'b-1',
    eventId: 'evt-sunset-wedding',
    category: 'Catering',
    name: 'Artisanal Kathiyawadi & Continental Banquet (140 guests)',
    planned: 380000,
    actual: 290000,
    status: 'Deposit Paid',
    notes: 'Includes live farsan counter, jalebi-fafda brunch, and dinner thali'
  },
  {
    id: 'b-2',
    eventId: 'evt-sunset-wedding',
    category: 'Decoration',
    name: 'Heritage Courtyard Floral Mandap & Marigold Canopies',
    planned: 280000,
    actual: 210000,
    status: 'Deposit Paid',
    notes: 'Locally sourced marigolds, 40 brass urlis, fairy light canopies'
  },
  {
    id: 'b-3',
    eventId: 'evt-sunset-wedding',
    category: 'Photography',
    name: 'Fine Art Candid Photography & Cinematic 4K Film',
    planned: 140000,
    actual: 90000,
    status: 'Deposit Paid',
    notes: '2 lead photographers, drone coverage for sunset pheras'
  },
  {
    id: 'b-4',
    eventId: 'evt-sunset-wedding',
    category: 'Entertainment',
    name: 'Acoustic Sangeet Ensemble, Folk Dhol & Sound Setup',
    planned: 120000,
    actual: 82000,
    status: 'Deposit Paid',
    notes: 'Live garba musicians for evening and wireless mics for rituals'
  },
  {
    id: 'b-5',
    eventId: 'evt-sunset-wedding',
    category: 'Other',
    name: 'Emergency Contingency & Transportation Reserve',
    planned: 80000,
    actual: 60000,
    status: 'Paid',
    notes: 'Safeguard buffer locked for out-of-town guest luxury vans'
  },
  // Birthday items
  {
    id: 'b-6',
    eventId: 'evt-milestone-birthday',
    category: 'Venue',
    name: 'Lake Pichola Rooftop Pavilion Hire',
    planned: 120000,
    actual: 120000,
    status: 'Paid',
    notes: 'Private terrace overlooking palace'
  },
  {
    id: 'b-7',
    eventId: 'evt-milestone-birthday',
    category: 'Catering',
    name: '4-Course Plated Dinner & Curated Bar Experience',
    planned: 150000,
    actual: 100000,
    status: 'Deposit Paid',
    notes: 'Artisanal wine pairings and bespoke cocktail menu'
  },
  {
    id: 'b-8',
    eventId: 'evt-milestone-birthday',
    category: 'Entertainment',
    name: 'Acoustic Jazz Trio 3-Hour Set',
    planned: 80000,
    actual: 40000,
    status: 'Deposit Paid',
    notes: 'Ambient dinner jazz and milestone toasts'
  }
];

export const initialTasks: TaskItem[] = [
  // Wedding Tasks (28 completed / 36 total, 8 pending)
  {
    id: 't-1',
    eventId: 'evt-sunset-wedding',
    title: 'Approve Kathiyawadi Tasting Menu',
    category: 'Catering',
    priority: 'high',
    dueDate: '2025-10-25',
    completed: false,
    assignee: 'Chef Rasikbhai'
  },
  {
    id: 't-2',
    eventId: 'evt-sunset-wedding',
    title: 'Finalize Mandap Floral Setup & Canopy Colors',
    category: 'Decoration',
    priority: 'high',
    dueDate: '2025-10-31',
    completed: false,
    assignee: 'Royal Decor Studio'
  },
  {
    id: 't-3',
    eventId: 'evt-sunset-wedding',
    title: 'Send Digital WhatsApp Video Invites',
    category: 'Invitations',
    priority: 'high',
    dueDate: '2025-11-02',
    completed: false,
    assignee: 'Kabir & Ananya'
  },
  {
    id: 't-4',
    eventId: 'evt-sunset-wedding',
    title: 'Baraat Procession Route & Dhol Troupe Check',
    category: 'Logistics',
    priority: 'medium',
    dueDate: '2025-11-05',
    completed: false,
    assignee: 'Heritage Haveli Coordinator'
  },
  {
    id: 't-5',
    eventId: 'evt-sunset-wedding',
    title: 'Assemble Guest Welcome Hampers & Regional Sweets',
    category: 'Hospitality',
    priority: 'medium',
    dueDate: '2025-11-08',
    completed: false,
    assignee: 'Priya Sharma'
  },
  {
    id: 't-6',
    eventId: 'evt-sunset-wedding',
    title: 'Sound Cutoff & Generator Pre-Check with DJ',
    category: 'Entertainment',
    priority: 'medium',
    dueDate: '2025-11-10',
    completed: false,
    assignee: 'Sound Lead Rahul'
  },
  {
    id: 't-7',
    eventId: 'evt-sunset-wedding',
    title: 'Review Final Guest Dietary Splits (Jain/Swaminarayan)',
    category: 'Catering',
    priority: 'low',
    dueDate: '2025-11-11',
    completed: false,
    assignee: 'Catering Lead'
  },
  {
    id: 't-8',
    eventId: 'evt-sunset-wedding',
    title: 'Final Run-of-Show Printout for Core Family Leads',
    category: 'Logistics',
    priority: 'low',
    dueDate: '2025-11-12',
    completed: false,
    assignee: 'Priya Sharma'
  },
  // Completed milestones for progress metrics
  {
    id: 't-c1',
    eventId: 'evt-sunset-wedding',
    title: 'Reserve Heritage Haveli Courtyard Venue',
    category: 'Venue',
    priority: 'high',
    dueDate: '2025-09-10',
    completed: true,
    assignee: 'Priya Sharma'
  },
  {
    id: 't-c2',
    eventId: 'evt-sunset-wedding',
    title: 'Select Wedding Attire & Color Swatches',
    category: 'Styling',
    priority: 'medium',
    dueDate: '2025-09-20',
    completed: true,
    assignee: 'Ananya'
  },
  {
    id: 't-c3',
    eventId: 'evt-sunset-wedding',
    title: 'Lock Candid Photographer Contract & Deposit',
    category: 'Photography',
    priority: 'high',
    dueDate: '2025-09-25',
    completed: true,
    assignee: 'Kabir'
  },
  {
    id: 't-c4',
    eventId: 'evt-sunset-wedding',
    title: 'Design Custom Digital Save-The-Dates',
    category: 'Invitations',
    priority: 'medium',
    dueDate: '2025-10-01',
    completed: true,
    assignee: 'Utsav AI Atelier'
  },
  {
    id: 't-c5',
    eventId: 'evt-sunset-wedding',
    title: 'Curate Sangeet Playlist with Acoustic Trio',
    category: 'Entertainment',
    priority: 'low',
    dueDate: '2025-10-05',
    completed: true,
    assignee: 'Sangeet Symphony'
  },
  // Additional completed tasks to reach 28 completed / 36 total
  ...Array.from({ length: 23 }).map((_, i) => ({
    id: `t-auto-done-${i}`,
    eventId: 'evt-sunset-wedding',
    title: `Pre-wedding Milestone Checkpoint #${i + 6}: Protocol verified`,
    category: ['Catering', 'Decoration', 'Logistics', 'Hospitality'][i % 4],
    priority: 'medium' as const,
    dueDate: '2025-10-15',
    completed: true,
    assignee: 'Atelier Team'
  }))
];

export const initialGuests: GuestItem[] = [
  {
    id: 'g-1',
    eventId: 'evt-sunset-wedding',
    name: 'Dr. Ramesh & Sudha Patel',
    phone: '+91 98250 12345',
    email: 'ramesh.patel@example.com',
    rsvp: 'confirmed',
    partySize: 4,
    group: 'Family',
    dietary: 'Strict Jain (No root vegetables)',
    notes: 'Grandparents, ground floor seating requested'
  },
  {
    id: 'g-2',
    eventId: 'evt-sunset-wedding',
    name: 'Vikram & Meera Singhania',
    phone: '+91 98111 67890',
    email: 'vikram.s@example.com',
    rsvp: 'confirmed',
    partySize: 2,
    group: 'VIP',
    dietary: 'Vegetarian',
    notes: 'Arriving from Mumbai on Nov 13, airport pickup needed'
  },
  {
    id: 'g-3',
    eventId: 'evt-sunset-wedding',
    name: 'Rohan Mehra & Group',
    phone: '+91 99200 45678',
    email: 'rohan.mehra@example.com',
    rsvp: 'confirmed',
    partySize: 5,
    group: 'Friends',
    dietary: 'Standard Feast',
    notes: 'College friends, seated at table 4'
  },
  {
    id: 'g-4',
    eventId: 'evt-sunset-wedding',
    name: 'Anjali Sharma & Family',
    phone: '+91 98450 33445',
    email: 'anjali.sharma@example.com',
    rsvp: 'pending',
    partySize: 3,
    group: 'Family',
    dietary: 'Vegetarian',
    notes: 'Awaiting leave confirmation'
  },
  {
    id: 'g-5',
    eventId: 'evt-sunset-wedding',
    name: 'Sunil & Kavita Joshi',
    phone: '+91 97230 88990',
    email: 'sunil.joshi@example.com',
    rsvp: 'declined',
    partySize: 2,
    group: 'Colleagues',
    dietary: 'N/A',
    notes: 'Traveling overseas for business'
  },
  {
    id: 'g-6',
    eventId: 'evt-sunset-wedding',
    name: 'Deepak & Sunita Shah',
    phone: '+91 98980 11223',
    email: 'deepak.shah@example.com',
    rsvp: 'confirmed',
    partySize: 3,
    group: 'Family',
    dietary: 'Swaminarayan Vegetarian',
    notes: 'Close maternal uncle'
  }
];

export const initialVendors: VendorItem[] = [
  {
    id: 'v-1',
    eventId: 'evt-sunset-wedding',
    name: 'Heritage Haveli Courtyard & Lawns',
    category: 'Venue',
    contact: 'Harshvardhan Jadeja (Manager)',
    phone: '+91 99240 55667',
    email: 'events@heritagehaveli.in',
    website: 'https://heritagehaveli.in',
    estimatedCost: 250000,
    status: 'Booked',
    notes: 'Deposit paid. Curfew 11:00 PM for amplified courtyard music.'
  },
  {
    id: 'v-2',
    eventId: 'evt-sunset-wedding',
    name: 'Rasik Gourmet & Royal Caterers',
    category: 'Catering',
    contact: 'Chef Rasikbhai',
    phone: '+91 98251 77889',
    email: 'rasikcaterers@example.com',
    estimatedCost: 380000,
    status: 'Booked',
    notes: 'Specializing in authentic Kathiyawadi recipes & 12 live counters.'
  },
  {
    id: 'v-3',
    eventId: 'evt-sunset-wedding',
    name: 'Royal Rajputana Decor Studio',
    category: 'Decoration',
    contact: 'Maya Kulkarni',
    phone: '+91 98200 99001',
    email: 'maya@royaldecor.in',
    estimatedCost: 280000,
    status: 'Booked',
    notes: 'Hammered brass urlis, marigold hanging garlands, linen runners.'
  },
  {
    id: 'v-4',
    eventId: 'evt-sunset-wedding',
    name: 'Golden Hour Cine Atelier',
    category: 'Photography',
    contact: 'Arjun Verma',
    phone: '+91 98190 44556',
    email: 'arjun@goldenhourfilms.com',
    estimatedCost: 140000,
    status: 'Booked',
    notes: '2 Candid photo leads, 1 aerial drone operator, 3-minute teaser reel.'
  },
  {
    id: 'v-5',
    eventId: 'evt-sunset-wedding',
    name: 'Sangeet Symphony Folk & Acoustic Troupe',
    category: 'Entertainment',
    contact: 'Karan Dave',
    phone: '+91 98790 33221',
    estimatedCost: 120000,
    status: 'Quoted',
    notes: 'Live acoustic garba ensemble + DJ sound console.'
  }
];

export const initialMoodboards: MoodboardItem[] = [
  {
    id: 'mb-1',
    eventId: 'evt-sunset-wedding',
    title: 'Chromatic Signature: Sunset Marigold & Deep Plum',
    category: 'Color Palette',
    paletteColors: ['#392538', '#C5A46D', '#C97862', '#FAF7F0', '#4A6B53'],
    notes: 'Deep Plum velvet runners juxtaposed against warm champagne gold cutlery and fresh orange-yellow marigolds. Accented by botanical sage leaves.',
  },
  {
    id: 'mb-2',
    eventId: 'evt-sunset-wedding',
    title: 'Heirloom Brass Urli & Candle Ponds',
    category: 'Floral & Decor',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0WHcqfREpMbgsgzV4Tx_H_Uhd8Psm3FPYTlhUx3wHT1Dvl5gaSygYAPniO8IES6DlM0gfynR0XENtFE6STWho2NnNsfrzcTJPWxDbxYEeHPT5w5wAjTVRcEPmPWdSGzkgdmUf6FCQKZ4gSXUFlME_wP2H3zroKz_iuI7ST4zyqeRpYGsg2Fyaddk76ov4OVMexgrILm_565IOhH0Qnj-vqayq7vQ8Mp6gXVMVPkjRLyTq5gFyt7-zjA',
    notes: 'Hammered antique brass vessels with floating scented mogra blossoms and handmade wax tea-lights along the courtyard walkway.',
  },
  {
    id: 'mb-3',
    eventId: 'evt-sunset-wedding',
    title: 'Textured Linen & Hand-thrown Terracotta Tablescapes',
    category: 'Dining & Table',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7Fh-7HBAy02yqxkp4RBPchAabQtrouLHmHybjkFGyRs3cJ_R1AlyHQ07XFly994n3m6uXPO6DuftsykTQydh1IX_qF1rvn6s7txorWLv3UkjbLckWOuCmeyMXJ9LDV_-FIDkSjmhNO-7KgVrE0wnPD--Hfr8B4rswUdzMXTQ01EIUkZ6qf1Cxhji5UaWAbN2vqgIGXaLlJvVW3n4PG3jAtcbgZnwWQG_Bt11UeJQjTGNxfsIFzchA8A',
    notes: 'Natural washed linen napkins, hand-painted terracotta water jugs, and handwritten parchment name tags with brass clips.',
  }
];

export interface FieldGuide {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  readTime: string;
  summary: string;
  content: string[];
}

export const editorialFieldGuides: FieldGuide[] = [
  {
    id: 'guide-wedding-budget',
    category: 'Budget Strategy',
    title: 'Wedding Budget Planning Guide: Where to Splurge & Where to Pare',
    subtitle: 'A breakdown of cost architectures across tier-1 venues, culinary spreads, and floral design.',
    readTime: '6 min read',
    summary: 'Master the 38-28-14-12 rule to protect your contingency fund and eliminate hidden vendor markups.',
    content: [
      'The biggest pitfall in celebration budgeting is committing 60% of funds before pricing production and hospitality logistics.',
      'Core Rule: Allocate 35-38% to Food & Beverage because guest memory correlates directly with hospitality pacing.',
      'Where to Splurge: Lighting architecture and sound engineering. Even simple florals look transcendent when illuminated with warm 2700K spotlighting.',
      'Where to Pare: Heavy paper stationery. Shift 80% of communication to responsive WhatsApp video dossiers with RSVP synchronization.'
    ]
  },
  {
    id: 'guide-birthday-milestone',
    category: 'Checklists',
    title: 'Birthday Party Planning: The Milestone 30th, 40th & 50th Playbook',
    subtitle: 'Curating unforgettable evenings that balance personal intimacy with sophisticated entertainment.',
    readTime: '5 min read',
    summary: 'How to design signature cocktail programs, speech pacing, and memory moments for milestone birthdays.',
    content: [
      'Milestone celebrations thrive on acoustic warmth rather than sensory overload.',
      'Keep guest counts calibrated: 25 to 60 guests allow meaningful conversation without breaking into isolated pockets.',
      'Pacing Strategy: Limit speeches to exactly 3 speakers (maximum 4 minutes each), followed by a toast and live music crescendo.',
      'Atmosphere: Ditch generic party banners; utilize candlelight clusters, velvet draping, and personalized vinyl records as guestbooks.'
    ]
  },
  {
    id: 'guide-day-of-timeline',
    category: 'Logistics',
    title: 'Event-Day Timeline Guide: The Minute-by-Minute Architecture',
    subtitle: 'Reverse-engineered milestone scheduling. Sync vendor delivery windows to avoid backstage bottlenecks.',
    readTime: '7 min read',
    summary: 'The secret to stress-free hosting: 15-minute buffers and a single authoritative Run-of-Show.',
    content: [
      'No host should be answering vendor calls on the celebration day. Assign a single logistics captain with the Run-of-Show dossier.',
      'Stagger vendor load-in: Sound & lighting at T-4h, florals at T-2.5h, cold catering at T-1.5h, hot counters at T-45m.',
      'The 15-Minute Rule: Always build a 15-minute ghost buffer before major moments (couple entrance, cake cutting, pheras) to absorb delays without stress.'
    ]
  },
  {
    id: 'guide-heritage-decor',
    category: 'Aesthetics',
    title: 'Decoration & Theme Inspiration: Harmonizing Heritage with Modernity',
    subtitle: 'Tactile guide to incorporating heirloom textiles, local stone, and sustainable floral installations.',
    readTime: '6 min read',
    summary: 'How to blend vintage brass, terracotta, and marigolds into clean contemporary spatial design.',
    content: [
      'Avoid artificial foam-backed plastic flowers. Locally harvested seasonal blooms (marigold, jasmine, rajnigandha) emit authentic botanical fragrance.',
      'Use raw textures: Unglazed terracotta vessels, handloom cotton runners, and hammered brass serveware impart grounded luxury.',
      'Restrained Color Palette: Limit your primary palette to 3 harmonious tones (e.g. Deep Plum, Champagne Gold, Soft Terracotta) with Ivory grounding.'
    ]
  },
  {
    id: 'guide-catering-calculator',
    category: 'Calculators',
    title: 'Guest Count & Catering Calculator: Eliminating Food Waste',
    subtitle: 'Formulaic metrics for multi-course dinners, grazing tables, late-night bites, and bar stocks.',
    readTime: '4 min read',
    summary: 'Scientific headcounts, dessert ratios, and signature cocktail volumes for Indian and international galas.',
    content: [
      'Standard Rule: 400-450 grams of total food per guest for dinner banquets; 250 grams for high-tea receptions.',
      'Dessert Math: Offer 2 warm dessert selections and 1 cold/ice-cream selection. Adding more than 4 desserts increases leftover waste by 34%.',
      'Bar Calculations: Plan for 2 drinks per guest for the first hour, and 1 drink per guest per subsequent hour.'
    ]
  },
  {
    id: 'guide-vendor-contracts',
    category: 'Vendor Etiquette',
    title: 'The Master Vendor Contract Checklist: Guarding Your Day',
    subtitle: 'Essential clauses for sound curfew, overtime rates, power redundancy, and weather contingencies.',
    readTime: '5 min read',
    summary: 'Five non-negotiable contractual protections to verify before transferring any booking advance.',
    content: [
      'Power Backup Clause: Ensure venue contracts explicitly guarantee generator changeover within 10 seconds of power cut.',
      'Overtime Hourly Cap: Agree on explicit hourly rates for sound and photography teams in case celebrations extend past midnight.',
      'Rain/Weather Contingency: Clearly define who provides waterproof canopies and whether indoor banquet relocation incurs extra cost.'
    ]
  }
];
