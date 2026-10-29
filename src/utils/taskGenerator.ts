import { TaskItem, TaskPriority, TaskStage, EventItem } from '../types';

export interface TaskTemplate {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  stage: TaskStage;
  suggestedDaysBefore: number; // e.g. 21 for 3 weeks before, 7 for 1 week before, 1 for 1 day before, 0 for event day, -1 for day after
  venueCondition?: 'home' | 'restaurant' | 'venue' | 'all';
  minGuests?: number;
}

/**
 * Calculates a realistic due date string (YYYY-MM-DD) based on the event date,
 * the suggested days before, and current date, with dynamic compression when time is short.
 */
export function calculateRealisticDueDate(
  eventDateStr: string,
  suggestedDaysBefore: number,
  referenceDate: Date = new Date()
): string {
  if (!eventDateStr) {
    return new Date().toISOString().split('T')[0];
  }

  const [y, m, d] = eventDateStr.split('-').map(Number);
  const eventDate = new Date(y, m - 1, d);
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilEvent = Math.round((eventDate.getTime() - today.getTime()) / msPerDay);

  let targetDate: Date;

  if (suggestedDaysBefore < 0) {
    // After event (e.g. -1 is 1 day after event)
    targetDate = new Date(eventDate.getTime() + Math.abs(suggestedDaysBefore) * msPerDay);
  } else if (suggestedDaysBefore === 0) {
    // Event day
    targetDate = new Date(eventDate.getTime());
  } else {
    // Pre-event task
    if (daysUntilEvent <= 0) {
      // Event is today or in the past
      targetDate = new Date(eventDate.getTime());
    } else if (daysUntilEvent <= 2) {
      // Event is tomorrow or in 2 days -> Pre-event tasks are scheduled for today
      targetDate = new Date(today.getTime());
    } else if (daysUntilEvent < suggestedDaysBefore) {
      // Time is compressed (e.g. task normally 14 days before, but event is in 5 days)
      // Proportionally compress between today and 1 day before event
      const compressedOffset = Math.max(1, Math.floor((suggestedDaysBefore / 21) * (daysUntilEvent - 1)));
      targetDate = new Date(eventDate.getTime() - compressedOffset * msPerDay);
      if (targetDate.getTime() < today.getTime()) {
        targetDate = new Date(today.getTime());
      }
    } else {
      // Normal schedule: eventDate minus suggestedDaysBefore
      targetDate = new Date(eventDate.getTime() - suggestedDaysBefore * msPerDay);
    }
  }

  const resY = targetDate.getFullYear();
  const resM = String(targetDate.getMonth() + 1).padStart(2, '0');
  const resD = String(targetDate.getDate()).padStart(2, '0');
  return `${resY}-${resM}-${resD}`;
}

/**
 * Returns a human-friendly relative deadline label
 */
export function getRelativeDeadlineLabel(dueDateStr: string, eventDateStr?: string): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isEventDay: boolean;
} {
  const today = new Date().toISOString().split('T')[0];
  const isToday = dueDateStr === today;
  const isOverdue = dueDateStr < today;
  const isEventDay = eventDateStr ? dueDateStr === eventDateStr : false;

  let label = dueDateStr;
  try {
    const [y, m, d] = dueDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (isEventDay) {
      label = `Event Day (${formatted})`;
    } else if (isToday) {
      label = `Due Today (${formatted})`;
    } else if (isOverdue) {
      const msDiff = new Date().getTime() - dateObj.getTime();
      const days = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      label = `${days}d overdue (${formatted})`;
    } else {
      label = formatted;
    }
  } catch {}

  return { label, isOverdue, isToday, isEventDay };
}

/**
 * Detects venue environment: 'home', 'restaurant', or 'venue'
 */
export function detectVenueType(venueStr: string = '', locationStr: string = ''): 'home' | 'restaurant' | 'venue' {
  const combined = `${venueStr} ${locationStr}`.toLowerCase();
  if (
    combined.includes('home') ||
    combined.includes('house') ||
    combined.includes('residence') ||
    combined.includes('apartment') ||
    combined.includes('flat') ||
    combined.includes('living room') ||
    combined.includes('backyard')
  ) {
    return 'home';
  }
  if (
    combined.includes('restaurant') ||
    combined.includes('cafe') ||
    combined.includes('bistro') ||
    combined.includes('dining') ||
    combined.includes('diner') ||
    combined.includes('hotel buffet')
  ) {
    return 'restaurant';
  }
  return 'venue';
}

// -------------------------------------------------------------
// EVENT SPECIFIC REALISTIC TASK TEMPLATES
// -------------------------------------------------------------

const BIRTHDAY_TEMPLATES: TaskTemplate[] = [
  // 2–3 weeks before (Planning)
  {
    title: 'Decide the birthday theme and decoration colors',
    description: 'Pick theme, balloon color scheme, and banner styles matching the celebrant’s taste.',
    category: 'Decorations',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 21,
  },
  {
    title: 'Set the party budget',
    description: 'Determine spending limits for cake, decorations, food, drinks, and party favors.',
    category: 'Budget',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 20,
  },
  {
    title: 'Prepare the guest list & send invitations',
    description: 'Compile guest list and send digital or printed invitations with RSVP deadline.',
    category: 'Guests',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 18,
  },
  {
    title: 'Book the party venue & confirm reservation',
    description: 'Confirm venue booking, seating capacity, and deposit requirements.',
    category: 'Venue',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 16,
    venueCondition: 'venue',
  },
  {
    title: 'Reserve restaurant table or private dining area',
    description: 'Confirm group table reservation and verify restaurant cake-cutting policy.',
    category: 'Venue',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 16,
    venueCondition: 'restaurant',
  },
  {
    title: 'Plan living room layout and party area at home',
    description: 'Plan furniture arrangement to ensure ample space for games, gifts, and mingling.',
    category: 'Venue',
    priority: 'medium',
    stage: 'planning',
    suggestedDaysBefore: 16,
    venueCondition: 'home',
  },
  {
    title: 'Order the birthday cake and confirm the design',
    description: 'Select bakery, choose flavor, tier, custom text, and lock in delivery or pickup time.',
    category: 'Food',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 14,
  },
  {
    title: 'Plan the food, snacks, and drinks menu',
    description: 'Finalize appetizers, main meal, beverages, and accommodate any guest allergies.',
    category: 'Food',
    priority: 'medium',
    stage: 'planning',
    suggestedDaysBefore: 14,
  },

  // 1 week before
  {
    title: 'Buy balloons, ribbons, banners, and birthday decorations',
    description: 'Purchase balloon sets, birthday banner, confetti, streamers, and hanging supplies.',
    category: 'Decorations',
    priority: 'high',
    stage: 'one-week-before',
    suggestedDaysBefore: 7,
  },
  {
    title: 'Order or purchase party supplies & tableware',
    description: 'Get plates, cups, forks, napkins, table covers, and party hats.',
    category: 'Decorations',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 6,
  },
  {
    title: 'Confirm the cake order and pickup or delivery time',
    description: 'Recheck bakery receipt, custom inscription, and exact delivery window.',
    category: 'Food',
    priority: 'high',
    stage: 'one-week-before',
    suggestedDaysBefore: 5,
  },
  {
    title: 'Confirm food arrangements with caterer or restaurant',
    description: 'Reconfirm final headcount, arrival time, and serving utensils.',
    category: 'Food',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 5,
  },
  {
    title: 'Buy candles, cake-cutting supplies, and matches/lighter',
    description: 'Ensure number candles, sparkler candles, cake knife, and lighter are ready.',
    category: 'Food',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 4,
  },
  {
    title: 'Prepare party games, playlist, and activities',
    description: 'Plan musical chairs, trivia, prizes, and compile an upbeat birthday music playlist.',
    category: 'Entertainment',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 3,
  },
  {
    title: 'Follow up with guests who have not responded',
    description: 'Reach out to pending invitees to lock in the final guest count.',
    category: 'Guests',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 3,
  },

  // 1 day before
  {
    title: 'Collect or confirm delivery of the birthday cake',
    description: 'Pick up cake or confirm arrival time; store safely in refrigerator.',
    category: 'Food',
    priority: 'high',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },
  {
    title: 'Check balloons, banners, lights, and decorations',
    description: 'Verify balloon pump, tape, hooks, string, and assemble backdrop elements.',
    category: 'Decorations',
    priority: 'medium',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },
  {
    title: 'Prepare return gifts or party favors',
    description: 'Pack goodie bags or personalized gifts for attending guests.',
    category: 'Hospitality',
    priority: 'medium',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },
  {
    title: 'Confirm the final guest count',
    description: 'Finalize seating count, food portions, and favor bag counts.',
    category: 'Guests',
    priority: 'medium',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },
  {
    title: 'Charge camera, phone, and speaker for taking photos',
    description: 'Ensure power banks, phone storage, and portable Bluetooth speakers are ready.',
    category: 'Photography',
    priority: 'low',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },
  {
    title: 'Pack decorations and supplies for the venue',
    description: 'Pack all decorations, cake knife, candles, and favors into transport boxes.',
    category: 'Logistics',
    priority: 'medium',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
    venueCondition: 'venue',
  },

  // On the birthday (Event day)
  {
    title: 'Set up tables, chairs, and the party area',
    description: 'Arrange layout, place table covers, and create space for mingling and gifts.',
    category: 'Venue',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Inflate balloons and hang the birthday banner',
    description: 'Set up balloon arch or clusters, hang banner, and test photo backdrop lighting.',
    category: 'Decorations',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Arrange food, drinks, plates, and napkins',
    description: 'Set up beverage station, snacks, cups, and napkins for easy guest access.',
    category: 'Food',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Set up the cake table, knife, and candles',
    description: 'Position cake centerpiece table with candles, matches, knife, and dessert plates.',
    category: 'Food',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Welcome guests and organize activities',
    description: 'Greet guests, direct them to food and drinks, and kick off games/playlist.',
    category: 'Hospitality',
    priority: 'medium',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Bring out the cake at the planned time & sing',
    description: 'Light candles, gather guests, sing birthday song, and take cake-cutting photos.',
    category: 'Food',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Take candid photos and group pictures',
    description: 'Capture celebrant with family, friends, and special moments throughout the party.',
    category: 'Photography',
    priority: 'medium',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Distribute return gifts and thank guests',
    description: 'Hand out favor bags to guests and thank them for attending.',
    category: 'Hospitality',
    priority: 'low',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Clean up the party area after the event',
    description: 'Dispose of plates, take down balloons, and pack remaining food safely.',
    category: 'Logistics',
    priority: 'medium',
    stage: 'after-event',
    suggestedDaysBefore: -1,
  },
];

const WEDDING_TEMPLATES: TaskTemplate[] = [
  // Planning (3–6 weeks before)
  {
    title: 'Finalize the wedding budget and guest list',
    description: 'Establish line-item allocations across venue, catering, decor, and photography.',
    category: 'Budget',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 35,
  },
  {
    title: 'Book the venue and confirm the date',
    description: 'Execute venue contracts, review sound curfew rules, and pay initial deposit.',
    category: 'Venue',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 30,
  },
  {
    title: 'Arrange catering and menu tasting',
    description: 'Conduct food tasting, confirm regional signature dishes, and record dietary splits.',
    category: 'Food',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 25,
  },
  {
    title: 'Book the photographer and videographer',
    description: 'Lock candid photographer, drone coverage, and pre-wedding shoot timing.',
    category: 'Photography',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 24,
  },
  {
    title: 'Choose outfits and arrange fittings',
    description: 'Finalize bridal and groom attire, schedule tailor alterations, and select matching footwear.',
    category: 'Attire',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 21,
  },
  {
    title: 'Finalize decoration, flowers, and stage design',
    description: 'Approve mandap architecture, floral color swatches, lighting, and entrance arches.',
    category: 'Decorations',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 18,
  },
  {
    title: 'Send invitations and track RSVPs',
    description: 'Dispatch physical/digital invitations and begin recording guest attendance counts.',
    category: 'Guests',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 16,
  },
  {
    title: 'Confirm transport and accommodation if required',
    description: 'Book hotel room blocks and arrange luxury shuttle vans for out-of-town guests.',
    category: 'Logistics',
    priority: 'medium',
    stage: 'planning',
    suggestedDaysBefore: 14,
  },

  // 1 week before
  {
    title: 'Check ceremony arrangements with the relevant people',
    description: 'Review ritual sequence with the priest/officiant and verify samagri checklist.',
    category: 'Ceremony',
    priority: 'high',
    stage: 'one-week-before',
    suggestedDaysBefore: 7,
  },
  {
    title: 'Confirm all vendors a few days before the wedding',
    description: 'Call florist, caterer, DJ, and photographer to confirm arrival times and load-in permits.',
    category: 'Vendors',
    priority: 'high',
    stage: 'one-week-before',
    suggestedDaysBefore: 5,
  },
  {
    title: 'Pack bridal emergency kit & steaming supplies',
    description: 'Pack safety pins, sewing kit, stain remover, band-aids, mints, and portable garment steamer.',
    category: 'Hospitality',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 4,
  },
  {
    title: 'Prepare vendor payment envelopes',
    description: 'Label cash or check envelopes for final balance payments and gratuities.',
    category: 'Budget',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 3,
  },

  // 1 day before
  {
    title: 'Conduct AV soundcheck and generator check at the venue',
    description: 'Test wireless microphones, speaker levels, and verify backup power generator.',
    category: 'Logistics',
    priority: 'high',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },
  {
    title: 'Organize ceremony attire, jewelry, and accessories',
    description: 'Steam all wedding garments and double-check jewelry, safas, and garlands.',
    category: 'Attire',
    priority: 'high',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },
  {
    title: 'Review run-of-show timeline with core family coordinators',
    description: 'Brief family coordinators on entry cues, photo groupings, and guest transfers.',
    category: 'Logistics',
    priority: 'medium',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },

  // Event day
  {
    title: 'Coordinate hair and makeup prep for bridal party',
    description: 'Ensure beauty artists begin 4 hours prior to ceremony to avoid schedule delays.',
    category: 'Attire',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Check the venue setup before guests arrive',
    description: 'Inspect seating, mandap florals, welcome drinks counter, and guest registration table.',
    category: 'Venue',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Manage Baraat / procession and entrance cues',
    description: 'Coordinate dhol timing, procession pathway, and bride/groom entry music.',
    category: 'Ceremony',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Capture golden-hour couple & family portraits',
    description: 'Ensure photographer conducts dedicated formal portraits before reception dinner.',
    category: 'Photography',
    priority: 'medium',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Oversee dining buffet opening and VIP service',
    description: 'Ensure dinner is served hot on schedule with dedicated assistance for elders.',
    category: 'Food',
    priority: 'medium',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },

  // After the event
  {
    title: 'Settle final vendor payments and return rentals',
    description: 'Disburse final payment balances, return rented jewelry/outfits, and retrieve security deposits.',
    category: 'Budget',
    priority: 'high',
    stage: 'after-event',
    suggestedDaysBefore: -1,
  },
  {
    title: 'Send thank-you messages to guests and helpers',
    description: 'Send heartfelt thank-you notes to attendees, coordinators, and wedding party.',
    category: 'Hospitality',
    priority: 'medium',
    stage: 'after-event',
    suggestedDaysBefore: -2,
  },
];

const FESTIVAL_TEMPLATES: TaskTemplate[] = [
  // Planning (2–3 weeks before)
  {
    title: 'Decide the celebration theme and budget',
    description: 'Plan festive color themes, puja timing, and budget allocations for sweets, decor, and gifts.',
    category: 'Budget',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 21,
  },
  {
    title: 'Invite family, friends, or community members',
    description: 'Send festive invitations for puja, dinner, and social celebration gatherings.',
    category: 'Guests',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 18,
  },
  {
    title: 'Plan food, sweets, and refreshments menu',
    description: 'Choose traditional festival dishes, prasad offerings, and order specialty mithai early.',
    category: 'Food',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 14,
  },

  // 1 week before
  {
    title: 'Purchase decorations and necessary supplies',
    description: 'Buy clay diyas, brass urlis, fairy lights, lanterns, and rangoli stencils/colors.',
    category: 'Decorations',
    priority: 'high',
    stage: 'one-week-before',
    suggestedDaysBefore: 7,
  },
  {
    title: 'Buy puja samagri, incense, and fresh flowers',
    description: 'Procure marigold garlands, lotus, kumkum, camphor, and holy offerings.',
    category: 'Ceremony',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 5,
  },
  {
    title: 'Prepare festive gift hampers or sweet boxes',
    description: 'Assemble dried fruit boxes or sweet hampers for visiting family and neighbors.',
    category: 'Hospitality',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 4,
  },
  {
    title: 'Check required venue permissions or safety arrangements',
    description: 'Ensure fire safety with lamps/firecrackers and verify building community guidelines.',
    category: 'Logistics',
    priority: 'high',
    stage: 'one-week-before',
    suggestedDaysBefore: 3,
  },

  // 1 day before
  {
    title: 'Prepare the celebration area & mandir altar',
    description: 'Clean the puja space, polish brass lamps, and arrange fresh flower drapery.',
    category: 'Venue',
    priority: 'high',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },
  {
    title: 'Hang lights, torans, and outdoor decorations',
    description: 'Install fairy lights along balconies and hang fresh mango-leaf torans on doors.',
    category: 'Decorations',
    priority: 'high',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },
  {
    title: 'Prepare fresh festive sweets and snacks',
    description: 'Cook or collect ordered mithai, farsan, and festival specialties.',
    category: 'Food',
    priority: 'medium',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },

  // Event day
  {
    title: 'Draw colorful entrance rangoli with flowers & powder',
    description: 'Create welcoming rangoli artwork at front entrance and place floating tea-light urlis.',
    category: 'Decorations',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Light evening diyas and festival lamps at dusk',
    description: 'Illuminate oil lamps, candles, and decorative lanterns around the venue.',
    category: 'Ceremony',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Perform festive puja and share prasad with guests',
    description: 'Conduct prayers, sing traditional aarti, and distribute blessed offerings.',
    category: 'Ceremony',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Serve festive feast and sweets',
    description: 'Host family and guests for traditional multi-course celebration feast.',
    category: 'Food',
    priority: 'medium',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },

  // After event
  {
    title: 'Arrange waste collection and cleanup',
    description: 'Safely extinguish all lamps, gather bio-waste flowers for compost, and store reusable lights.',
    category: 'Logistics',
    priority: 'medium',
    stage: 'after-event',
    suggestedDaysBefore: -1,
  },
];

const CORPORATE_TEMPLATES: TaskTemplate[] = [
  // Planning (3–6 weeks before)
  {
    title: 'Confirm the event objective and budget',
    description: 'Define clear KPI goals, leadership approvals, and line-item budget allocation.',
    category: 'Budget',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 30,
  },
  {
    title: 'Book a suitable venue or meeting space',
    description: 'Reserve conference hall with adequate stage, breakout rooms, and high-speed Wi-Fi.',
    category: 'Venue',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 28,
  },
  {
    title: 'Prepare the attendee list & registration details',
    description: 'Create invite list, set up RSVP portal, and distribute corporate invitations.',
    category: 'Guests',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 24,
  },
  {
    title: 'Arrange speakers and presentation materials',
    description: 'Confirm keynote speakers, gather presentation decks, and outline agenda.',
    category: 'Program',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 20,
  },
  {
    title: 'Confirm audiovisual equipment and internet access',
    description: 'Review specs for wireless lapels, roving mics, projectors, confidence monitors, and Wi-Fi.',
    category: 'AV & Tech',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 16,
  },

  // 1 week before
  {
    title: 'Coordinate catering and seating arrangements',
    description: 'Confirm coffee/tea breaks, networking lunch buffet, and VIP table layout.',
    category: 'Food',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 7,
  },
  {
    title: 'Prepare the agenda and event signage',
    description: 'Print event schedules, name badges, directional standees, and stage backdrop banners.',
    category: 'Logistics',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 6,
  },
  {
    title: 'Confirm vendor arrangements and load-in timings',
    description: 'Verify delivery windows with caterer, AV crew, and security staff.',
    category: 'Vendors',
    priority: 'high',
    stage: 'one-week-before',
    suggestedDaysBefore: 4,
  },

  // 1 day before
  {
    title: 'Test microphones, screens, and presentations before the event',
    description: 'Conduct full technical rehearsal with speakers to verify clickers, audio, and video clips.',
    category: 'AV & Tech',
    priority: 'high',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },
  {
    title: 'Check registration and guest welcome arrangements',
    description: 'Organize badge pick-up trays, check-in devices, and delegate welcome kits.',
    category: 'Guests',
    priority: 'medium',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },

  // Event day
  {
    title: 'Staff registration desk & greet arrivals',
    description: 'Welcome attendees, distribute lanyards, badges, and answer questions.',
    category: 'Guests',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Manage timekeeping for keynote sessions and breaks',
    description: 'Ensure speakers adhere to allotted times and guide attendees to coffee stations.',
    category: 'Program',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Capture high-res photography of speeches & networking',
    description: 'Document stage presentations, awards, and networking moments for company communications.',
    category: 'Photography',
    priority: 'medium',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },

  // After event
  {
    title: 'Distribute attendee survey and thank-you notes',
    description: 'Email presentation decks, thank-you notes, and feedback questionnaires to attendees.',
    category: 'Hospitality',
    priority: 'medium',
    stage: 'after-event',
    suggestedDaysBefore: -1,
  },
];

const ANNIVERSARY_TEMPLATES: TaskTemplate[] = [
  // Planning (2–4 weeks before)
  {
    title: 'Decide the celebration style and budget',
    description: 'Determine whether to host an intimate romantic dinner, weekend getaway, or party.',
    category: 'Budget',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 21,
  },
  {
    title: 'Choose a venue or plan a home celebration',
    description: 'Book a fine dining restaurant, romantic pavilion, or plan candlelit decor at home.',
    category: 'Venue',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 18,
  },
  {
    title: 'Invite guests if the celebration includes others',
    description: 'Send invitations to family and close friends if hosting a celebratory gathering.',
    category: 'Guests',
    priority: 'medium',
    stage: 'planning',
    suggestedDaysBefore: 16,
  },
  {
    title: 'Prepare a gift or personal message',
    description: 'Select anniversary gift, write a heartfelt card, or curate a photo memory album.',
    category: 'Hospitality',
    priority: 'high',
    stage: 'planning',
    suggestedDaysBefore: 14,
  },

  // 1 week before
  {
    title: 'Book a restaurant or finalize the dinner menu',
    description: 'Lock in table reservation, special culinary requests, and wine/dessert pairings.',
    category: 'Food',
    priority: 'high',
    stage: 'one-week-before',
    suggestedDaysBefore: 7,
  },
  {
    title: 'Arrange flowers and anniversary cake',
    description: 'Order celebrant’s favorite flowers and customized anniversary cake with message.',
    category: 'Decorations',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 6,
  },
  {
    title: 'Confirm reservations and arrangements',
    description: 'Recheck reservation time, table decor requests, and guest headcount.',
    category: 'Venue',
    priority: 'medium',
    stage: 'one-week-before',
    suggestedDaysBefore: 3,
  },

  // 1 day before
  {
    title: 'Confirm pickup of flowers, cake, and gift wrap',
    description: 'Verify fresh floral delivery and wrap anniversary gift with personalized note.',
    category: 'Hospitality',
    priority: 'medium',
    stage: 'one-day-before',
    suggestedDaysBefore: 1,
  },

  // Event day
  {
    title: 'Set up the celebration space before dinner/guests arrive',
    description: 'Arrange mood lighting, candles, fresh flowers, and celebratory background music.',
    category: 'Decorations',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Share celebratory toast and exchange gifts',
    description: 'Celebrate milestone, give personalized gift, and enjoy commemorative dinner.',
    category: 'Hospitality',
    priority: 'high',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
  {
    title: 'Capture commemorative portrait photos',
    description: 'Take high quality portraits to remember this milestone anniversary.',
    category: 'Photography',
    priority: 'medium',
    stage: 'event-day',
    suggestedDaysBefore: 0,
  },
];

/**
 * Main generator: selects the appropriate template matching the event type,
 * filters according to venue type and guest count, and computes realistic deadlines.
 */
export function generateEventSpecificTasks(
  event: Partial<EventItem> | any,
  existingTasks: TaskItem[] = []
): TaskItem[] {
  const eventId = event?.id || 'evt-current';
  const eventType = (event?.type || event?.eventType || 'Other').toLowerCase();
  const eventDate = event?.date || new Date().toISOString().split('T')[0];
  const venueType = detectVenueType(event?.venue || '', event?.location || event?.city || '');
  const guestCount = Number(event?.guestCount) || 50;

  let templates: TaskTemplate[] = [];

  if (eventType.includes('birthday')) {
    templates = BIRTHDAY_TEMPLATES;
  } else if (eventType.includes('wedding') || eventType.includes('vivaha') || eventType.includes('sangeet')) {
    templates = WEDDING_TEMPLATES;
  } else if (eventType.includes('festival') || eventType.includes('diwali') || eventType.includes('puja')) {
    templates = FESTIVAL_TEMPLATES;
  } else if (eventType.includes('corporate') || eventType.includes('gala') || eventType.includes('conference')) {
    templates = CORPORATE_TEMPLATES;
  } else if (eventType.includes('anniversary')) {
    templates = ANNIVERSARY_TEMPLATES;
  } else {
    // Default tailored celebration checklist
    templates = [
      ...BIRTHDAY_TEMPLATES.filter(t => t.stage === 'planning' || t.stage === 'event-day'),
      ...ANNIVERSARY_TEMPLATES.filter(t => t.stage === 'one-week-before' || t.stage === 'one-day-before'),
    ];
  }

  // Filter templates based on venue condition & guests
  const applicableTemplates = templates.filter(t => {
    if (t.venueCondition && t.venueCondition !== 'all') {
      if (t.venueCondition !== venueType) {
        return false;
      }
    }
    if (t.minGuests && guestCount < t.minGuests) {
      return false;
    }
    return true;
  });

  // Existing normalized titles to prevent duplicates
  const existingNormalized = new Set(
    existingTasks
      .filter(t => t.eventId === eventId)
      .map(t => t.title.toLowerCase().trim())
  );

  const generated: TaskItem[] = [];
  const now = new Date();

  applicableTemplates.forEach((template, index) => {
    const norm = template.title.toLowerCase().trim();
    if (existingNormalized.has(norm)) {
      return; // Skip duplicate
    }

    const calculatedDueDate = calculateRealisticDueDate(eventDate, template.suggestedDaysBefore, now);

    generated.push({
      id: `task-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      eventId,
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      dueDate: calculatedDueDate,
      stage: template.stage,
      completed: false,
      assignee: 'Host Council',
      notes: template.description,
    });
  });

  return generated;
}
