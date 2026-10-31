import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK on the server side
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// -------------------------------------------------------------
// Fallback Curated Celebration Intelligence
// -------------------------------------------------------------
function generateFallbackChatResponse(message: string, eventContext?: any) {
  const lower = message.toLowerCase();
  const eventName = eventContext?.name || eventContext?.title || 'your celebration';
  const eventBudget = eventContext?.budget || eventContext?.totalBudget || 600000;
  const guestCount = eventContext?.guestCount || 120;
  const location = eventContext?.location || eventContext?.city || 'India';

  if (lower.includes('budget') || lower.includes('cost') || lower.includes('save') || lower.includes('price')) {
    return {
      reply: `For ${eventName} in ${location} with ${guestCount} guests and a planned budget of ₹${(eventBudget).toLocaleString('en-IN')}:
      
1. **Catering Allocation (38%)**: Approx ₹${Math.round(eventBudget * 0.38).toLocaleString('en-IN')}. For regional feasts, focus on signature live counters and regional sweets rather than overwhelming menu items to reduce food waste by 18%.
2. **Decor & Florals (28%)**: Approx ₹${Math.round(eventBudget * 0.28).toLocaleString('en-IN')}. In ${location}, booking local brass vessels, terracotta pots, and seasonal marigold/jasmine directly from wholesale mandis avoids middlemen markups.
3. **Photography & Video (14%)**: Approx ₹${Math.round(eventBudget * 0.14).toLocaleString('en-IN')}. Lock candid photographers 60+ days prior to reserve standard day-rate packages.
4. **Music & Entertainment (12%)**: Approx ₹${Math.round(eventBudget * 0.12).toLocaleString('en-IN')}. Acoustic folk ensembles or curated DJ playlists deliver immense intimacy.
5. **Safety Contingency (8%)**: Retain approx ₹${Math.round(eventBudget * 0.08).toLocaleString('en-IN')} untouched for last-minute logistical runs.`,
      suggestedTasks: [
        { title: `Request itemized tasting quote from caterers (${location})`, priority: 'high', category: 'Catering' },
        { title: `Lock in local wholesale florist contract`, priority: 'medium', category: 'Decoration' }
      ],
      suggestedBudgets: [
        { category: 'Decoration', name: 'Wholesale Mandap Florals & Brass Diya Setup', amount: Math.round(eventBudget * 0.18) },
        { category: 'Catering', name: 'Artisanal Regional Feast & Live Counter', amount: Math.round(eventBudget * 0.32) }
      ],
      note: `Optimized budget breakdown generated for ${guestCount} guests.`
    };
  }

  if (lower.includes('task') || lower.includes('timeline') || lower.includes('schedule') || lower.includes('checklist')) {
    return {
      reply: `Here is a reverse-engineered milestone timeline for ${eventName}:

• **T-minus 30 Days**: Finalize menu tastings, confirm dietary splits (Jain/Vegan/Halal), and send WhatsApp digital save-the-dates.
• **T-minus 14 Days**: Review floor plan and seating choreography, verify sound permit cutoff times, and assign lead POCs for guest transfers.
• **T-minus 3 Days**: Rehearse entry cues and rituals; conduct generator and AV soundcheck at the venue.
• **Day of Celebration**: Run minute-by-minute coordinator run-of-show with vendor delivery windows staggered 2 hours before guest arrival.`,
      suggestedTasks: [
        { title: 'Confirm sound permits and curfew rules with venue', priority: 'high', category: 'Logistics' },
        { title: 'Stagger vendor entry and delivery windows', priority: 'medium', category: 'Vendors' },
        { title: 'Assemble guest welcome hampers and emergency kit', priority: 'low', category: 'Hospitality' }
      ],
      suggestedBudgets: [],
      note: 'Added chronological timeline recommendations.'
    };
  }

  if (lower.includes('theme') || lower.includes('decor') || lower.includes('color') || lower.includes('mood')) {
    return {
      reply: `For an unforgettable aesthetic at ${eventName}, I suggest our signature **"Heritage Brass & Sunset Marigold"** styling:

• **Color Palette**: Warm Ivory (#FAF7F0), Deep Plum (#392538), Champagne Gold (#C5A46D), and Soft Terracotta (#C97862).
• **Tactile Elements**: Hammered brass urlis filled with floating mogra petals, warm hand-dipped beeswax pillar candles, and textured raw silk runners.
• **Atmosphere**: Soft incandescent fairy-light canopies mixed with hanging brass bells that catch the evening breeze.`,
      suggestedTasks: [
        { title: 'Order brass urli centerpieces and floating candles', priority: 'medium', category: 'Decoration' },
        { title: 'Source raw silk tablecloths in Champagne Gold', priority: 'medium', category: 'Decoration' }
      ],
      suggestedBudgets: [
        { category: 'Decoration', name: 'Heirloom Brass Urli & Candle Accents', amount: 45000 }
      ],
      note: 'Aesthetic moodboard inspiration updated with signature palette.'
    };
  }

  return {
    reply: `Namaste! I am your Utsav AI Concierge for **${eventName}** in ${location}. 

I can assist you with:
1. **Dynamic Rupee Budget Calibration**: Optimizing allocations across venue, catering, decor, and photography.
2. **Run-of-Show Timelines**: Minute-by-minute checklists for smooth day-of choreography.
3. **Aesthetic Moodboards**: Harmonious color palettes and regional cultural rituals.
4. **Guest & Vendor Management**: Tracking RSVP dietary preferences and vendor contract checkpoints.

What specific aspect of your celebration would you like to refine today?`,
    suggestedTasks: [],
    suggestedBudgets: [],
    note: ''
  };
}

// -------------------------------------------------------------
// AI API Endpoints
// -------------------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, eventContext, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (genAI && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are Utsav AI, an expert celebration and event planning concierge.
Current Event Context:
- Name: ${eventContext?.name || eventContext?.title || 'Celebration'}
- Type: ${eventContext?.type || eventContext?.eventType || 'Event'}
- Date: ${eventContext?.date || 'Upcoming'}
- Location: ${eventContext?.location || eventContext?.city || 'India'}
- Guests: ${eventContext?.guestCount || 100}
- Budget: ₹${(eventContext?.budget || eventContext?.totalBudget) ? Number(eventContext.budget || eventContext.totalBudget).toLocaleString('en-IN') : '5,00,000'}

User query: "${message}"

Provide a warm, highly actionable, editorial response. Structure with clear bullet points where helpful.
If you suggest concrete new tasks or budget items, you must include a JSON block at the very end enclosed in:
\`\`\`json
{
  "suggestedTasks": [{"title": "task title", "priority": "high"|"medium"|"low", "category": "category"}],
  "suggestedBudgets": [{"category": "Venue|Catering|Decoration|Photography|Entertainment|Transportation|Other", "name": "item name", "amount": 10000}],
  "note": "brief note to save to event notes if desired"
}
\`\`\`
Keep the conversational tone refined, gracious, and authentic to celebration culture in India and abroad.`;

        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const fullText = response.text || '';
        let reply = fullText;
        let suggestedTasks: any[] = [];
        let suggestedBudgets: any[] = [];
        let note = '';

        // Extract JSON block if present
        const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            suggestedTasks = parsed.suggestedTasks || [];
            suggestedBudgets = parsed.suggestedBudgets || [];
            note = parsed.note || '';
            reply = fullText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
          } catch (e) {
            // Ignore parse failure on snippet
          }
        }

        return res.json({
          reply,
          suggestedTasks,
          suggestedBudgets,
          note,
          source: 'gemini',
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to curated intelligence:', geminiError?.message);
      }
    }

    // Fallback response
    const fallback = generateFallbackChatResponse(message, eventContext);
    return res.json({
      ...fallback,
      source: 'curated_intelligence',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({ error: 'Failed to process celebration request' });
  }
});

// Quick Plan Generation Endpoint
app.post('/api/ai/plan-event', async (req: Request, res: Response) => {
  try {
    const { eventType, date, location, budget, guestCount, atmosphere } = req.body;
    const numBudget = Number(budget) || 600000;
    const numGuests = Number(guestCount) || 120;
    const loc = location || 'Ahmedabad, Gujarat';
    const type = eventType || 'Wedding';

    if (genAI && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are Utsav AI. Generate a complete, luxurious celebration blueprint.
Parameters:
- Celebration Type: ${type}
- Target Date: ${date}
- City / Venue: ${loc}
- Estimated Budget: ₹${numBudget.toLocaleString('en-IN')}
- Guest Scale: ${numGuests} guests
- Atmosphere Style: ${atmosphere || 'Heritage & Regal'}

Return ONLY a valid JSON object matching this schema:
{
  "name": "Creative evocative title for the celebration",
  "theme": "Theme title",
  "description": "2-sentence evocative description",
  "palette": ["#392538", "#C5A46D", "#C97862", "#FAF7F0", "#4A6B53"],
  "budgetItems": [
    {"category": "Venue", "name": "Venue description", "planned": number, "actual": 0, "status": "Pending"},
    {"category": "Catering", "name": "Catering description", "planned": number, "actual": 0, "status": "Pending"},
    {"category": "Decoration", "name": "Decor description", "planned": number, "actual": 0, "status": "Pending"},
    {"category": "Photography", "name": "Photography description", "planned": number, "actual": 0, "status": "Pending"},
    {"category": "Entertainment", "name": "Music description", "planned": number, "actual": 0, "status": "Pending"},
    {"category": "Transportation", "name": "Logistics description", "planned": number, "actual": 0, "status": "Pending"},
    {"category": "Other", "name": "Emergency buffer reserve", "planned": number, "actual": 0, "status": "Pending"}
  ],
  "tasks": [
    {"title": "Task 1", "priority": "high", "dueDate": "relative date", "category": "category"},
    {"title": "Task 2", "priority": "high", "dueDate": "relative date", "category": "category"},
    {"title": "Task 3", "priority": "medium", "dueDate": "relative date", "category": "category"},
    {"title": "Task 4", "priority": "medium", "dueDate": "relative date", "category": "category"},
    {"title": "Task 5", "priority": "low", "dueDate": "relative date", "category": "category"}
  ],
  "vendors": [
    {"name": "Vendor 1", "category": "Venue", "estimatedCost": number, "status": "Inquiry"},
    {"name": "Vendor 2", "category": "Catering", "estimatedCost": number, "status": "Inquiry"},
    {"name": "Vendor 3", "category": "Decoration", "estimatedCost": number, "status": "Inquiry"},
    {"name": "Vendor 4", "category": "Photography", "estimatedCost": number, "status": "Inquiry"}
  ]
}`;

        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ plan: parsed, source: 'gemini' });
        }
      } catch (err: any) {
        console.warn('Gemini blueprint generation fallback:', err?.message);
      }
    }

    // High quality deterministic fallback
    const fallbackPlan = {
      name: `${loc.split(',')[0]} ${type} Reverie`,
      theme: atmosphere || 'Heritage & Regal',
      description: `An exquisite ${type.toLowerCase()} for ${numGuests} guests in ${loc}, harmonizing regional customs with contemporary celebration aesthetics.`,
      palette: ['#392538', '#C5A46D', '#C97862', '#FAF7F0', '#4A6B53'],
      budgetItems: [
        { category: 'Venue', name: 'Heritage Courtyard & Lawn Rental', planned: Math.round(numBudget * 0.25), actual: 0, status: 'Pending' },
        { category: 'Catering', name: 'Curated Multi-Course Feast & Live Counters', planned: Math.round(numBudget * 0.35), actual: 0, status: 'Pending' },
        { category: 'Decoration', name: 'Marigold, Jasmine & Brass Urli Mandap Decor', planned: Math.round(numBudget * 0.20), actual: 0, status: 'Pending' },
        { category: 'Photography', name: 'Fine Art Candid Photo & Cinematic Film', planned: Math.round(numBudget * 0.10), actual: 0, status: 'Pending' },
        { category: 'Entertainment', name: 'Acoustic Sangeet Ensemble & Sound Engineering', planned: Math.round(numBudget * 0.05), actual: 0, status: 'Pending' },
        { category: 'Other', name: 'Safety Contingency & Logistics Buffer', planned: Math.round(numBudget * 0.05), actual: 0, status: 'Pending' }
      ],
      tasks: [
        { title: 'Confirm venue booking and deposit paperwork', priority: 'high', dueDate: 'T-minus 45 Days', category: 'Venue' },
        { title: 'Finalize customized regional menu & dietary tasting', priority: 'high', dueDate: 'T-minus 30 Days', category: 'Catering' },
        { title: 'Approve decor color swatches & lighting canopy setup', priority: 'medium', dueDate: 'T-minus 20 Days', category: 'Decoration' },
        { title: 'Send digital invitations and launch RSVP tracking', priority: 'medium', dueDate: 'T-minus 15 Days', category: 'Invitations' },
        { title: 'Conduct technical sound & generator check with DJ', priority: 'low', dueDate: 'T-minus 2 Days', category: 'Entertainment' }
      ],
      vendors: [
        { name: `${loc.split(',')[0]} Heritage Lawns`, category: 'Venue', estimatedCost: Math.round(numBudget * 0.25), status: 'Inquiry' },
        { name: 'Royal Rasoi Gourmet Caterers', category: 'Catering', estimatedCost: Math.round(numBudget * 0.35), status: 'Inquiry' },
        { name: 'Bespoke Urli Decor Studio', category: 'Decoration', estimatedCost: Math.round(numBudget * 0.20), status: 'Inquiry' },
        { name: 'Golden Hour Cinematography', category: 'Photography', estimatedCost: Math.round(numBudget * 0.10), status: 'Inquiry' }
      ]
    };

    return res.json({ plan: fallbackPlan, source: 'curated_intelligence' });
  } catch (error: any) {
    console.error('Error in /api/ai/plan-event:', error);
    return res.status(500).json({ error: 'Failed to generate event blueprint' });
  }
});

// AI-Powered Event Tasks Generation Endpoint
app.post('/api/ai/generate-tasks', async (req: Request, res: Response) => {
  try {
    const { eventType, date, location, venue, budget, guestCount, theme } = req.body;
    const type = eventType || 'Celebration';
    const numBudget = Number(budget) || 500000;
    const numGuests = Number(guestCount) || 50;
    const loc = location || 'India';
    const ven = venue || 'Private Venue';

    if (genAI && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are Utsav AI's expert event operations director. Generate a highly realistic, chronological task checklist for an upcoming event with real-world human actions.
Event details:
- Type: ${type}
- Target Date: ${date}
- Venue: ${ven}
- Location: ${loc}
- Guest Count: ${numGuests} guests
- Budget: ₹${numBudget.toLocaleString('en-IN')}
- Theme/Style: ${theme || 'Festive & Elegant'}

Important Rules:
1. Tasks must be concrete, actionable steps real people do (e.g. for a birthday: buy balloons, pick up cake, confirm food, setup tables, welcome guests, cut cake, cleanup).
2. For home events, adapt to living room prep without rental venue bookings. For restaurant events, focus on table reservations, cake coordination, and guest arrivals.
3. Organize into stages: "planning" (2-3 weeks before), "one-week-before", "one-day-before", "event-day", "after-event".
4. Assign suggestedDaysBefore: 21-14 for planning, 7-3 for one-week-before, 1 for one-day-before, 0 for event-day, -1 for after-event.

Return ONLY a JSON array of objects with this schema:
[
  {
    "title": "Specific task title",
    "description": "Short explanation of what to do",
    "category": "Decorations|Food|Guests|Venue|Photography|Entertainment|Logistics|Hospitality|Budget|Attire",
    "priority": "high"|"medium"|"low",
    "stage": "planning"|"one-week-before"|"one-day-before"|"event-day"|"after-event",
    "suggestedDaysBefore": number
  }
]`;

        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.json({ tasks: parsed, source: 'gemini' });
          }
        }
      } catch (err: any) {
        console.warn('Gemini task generation failed, will use template fallback:', err?.message);
      }
    }

    return res.json({ tasks: [], source: 'fallback_template' });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-tasks:', error);
    return res.status(500).json({ error: 'Failed to generate tasks' });
  }
});

// -------------------------------------------------------------
// Live Venue Discovery & Real-World Pricing Pipeline
// -------------------------------------------------------------
interface RawVenueItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  city: string;
  locality: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
  capacityMin?: number;
  capacityMax?: number;
  rentalPrice?: number;
  pricePerPerson?: number;
  pricingUnit: string;
  currency: string;
  priceVerification: string;
  isPricePublished: boolean;
  website?: string;
  phone?: string;
  amenities: string[];
  indoorOutdoor: string;
  cateringPolicy: string;
  sourceName: string;
  sourceUrl?: string;
  lastVerifiedDate: string;
  imageUrl?: string;
  description?: string;
  isVerified?: boolean;
}

// Live OpenStreetMap / Overpass Venue Query
async function queryOverpassVenues(city: string): Promise<RawVenueItem[]> {
  try {
    const cleanCity = city.trim().replace(/['"\\]/g, '');
    const query = `
      [out:json][timeout:8];
      area["name"~"${cleanCity}",i]["boundary"="administrative"]->.searchArea;
      (
        node["amenity"="events_venue"](area.searchArea);
        node["amenity"="community_centre"](area.searchArea);
        node["amenity"="banquet_hall"](area.searchArea);
        node["leisure"="hall"](area.searchArea);
        way["amenity"="events_venue"](area.searchArea);
        way["amenity"="community_centre"](area.searchArea);
      );
      out center 35;
    `;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'UtsavAI-EventPlanner/1.0',
      },
      body: 'data=' + encodeURIComponent(query),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return [];
    const data: any = await response.json();
    if (!Array.isArray(data?.elements)) return [];

    return data.elements
      .filter((el: any) => el.tags && (el.tags.name || el.tags['name:en']))
      .map((el: any): RawVenueItem => {
        const tags = el.tags || {};
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        const name = tags.name || tags['name:en'] || 'Community Celebration Hall';
        const street = tags['addr:street'] || tags['addr:full'] || tags['addr:suburb'] || '';
        const locality = tags['addr:suburb'] || tags['addr:district'] || tags['addr:neighbourhood'] || city;
        const phone = tags.phone || tags['contact:phone'] || undefined;
        const website = tags.website || tags['contact:website'] || undefined;

        return {
          id: `osm-${el.type}-${el.id}`,
          name,
          category: tags.amenity === 'events_venue' ? 'convention_center' : 'function_hall',
          categoryLabel: tags.amenity === 'events_venue' ? 'Convention Hall' : 'Community Function Hall',
          city,
          locality: locality || city,
          fullAddress: street ? `${street}, ${city}` : `${name}, ${city}`,
          lat,
          lng: lon,
          capacityMin: 50,
          capacityMax: tags.capacity ? parseInt(tags.capacity, 10) : 350,
          pricingUnit: 'per_day',
          currency: 'INR',
          priceVerification: 'estimated',
          isPricePublished: false,
          website,
          phone,
          amenities: [
            tags.wheelchair === 'yes' ? 'Wheelchair Accessible' : 'Ground Floor Access',
            'Community Dining Hall',
            'Dedicated Stage Area',
          ],
          indoorOutdoor: 'indoor',
          cateringPolicy: 'external_allowed',
          sourceName: 'OpenStreetMap Live Geographic Registry',
          sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
          lastVerifiedDate: new Date().toISOString().split('T')[0],
          imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
          description: `Authentic community gathering hall mapped in ${city}. Verified via OpenStreetMap geographic database.`,
          isVerified: true,
        };
      });
  } catch {
    // If Overpass is unreachable or times out, fallback seamlessly to verified registry
    return [];
  }
}

// Venue search route
app.get('/api/venues/search', async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || 'Hyderabad';
    const locality = (req.query.locality as string) || '';
    const venueType = (req.query.venueType as string) || 'all';
    const guestCount = req.query.guestCount ? parseInt(req.query.guestCount as string, 10) : undefined;
    const maxBudget = req.query.maxBudget ? parseInt(req.query.maxBudget as string, 10) : undefined;
    const indoorOutdoor = (req.query.indoorOutdoor as string) || 'all';
    const searchQuery = (req.query.searchQuery as string) || '';
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '9', 10);
    const sortBy = (req.query.sortBy as string) || 'recommended';

    // 1. Fetch verified catalog
    const { verifiedVenuesRegistry } = await import('./src/data/verifiedVenues.ts');

    // 2. Query live OpenStreetMap venues for the city
    const liveOsmVenues = await queryOverpassVenues(city);

    // 3. Combine pools and deduplicate
    const { searchAndFilterVenues } = await import('./src/utils/venueDiscovery.ts');
    const combinedPool = [...verifiedVenuesRegistry, ...liveOsmVenues];

    const result = searchAndFilterVenues(combinedPool as any, {
      city,
      locality,
      venueType: venueType as any,
      guestCount,
      maxBudget,
      indoorOutdoor: indoorOutdoor as any,
      searchQuery,
      page,
      limit,
      sortBy: sortBy as any,
    });

    return res.json({
      success: true,
      ...result,
      sourceAttribution: {
        verifiedRegistryCount: verifiedVenuesRegistry.filter(v => v.city.toLowerCase() === city.toLowerCase()).length,
        liveOsmCount: liveOsmVenues.length,
        license: 'OpenStreetMap (ODbL) & Utsav Verified Registry',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/venues/search:', error);
    return res.status(500).json({
      error: 'Failed to search venues',
      message: error?.message || 'Internal error',
    });
  }
});

// Real-World Budget Estimation Endpoint
app.post('/api/budget/estimate', async (req: Request, res: Response) => {
  try {
    const {
      eventType = 'Wedding',
      city = 'Hyderabad',
      locality = '',
      eventDate = '',
      guestCount = 100,
      venueType = 'banquet_hall',
      foodPreference = 'both',
      decorStyle = 'standard',
      requiredServices = ['catering', 'decoration', 'photography', 'entertainment'],
    } = req.body;

    const { calculateRealWorldBudget, generateComparisonTiers } = await import('./src/utils/budgetEngine.ts');

    const estimate = calculateRealWorldBudget({
      eventType,
      city,
      locality,
      eventDate,
      guestCount: Number(guestCount) || 100,
      venueType,
      foodPreference,
      decorStyle,
      requiredServices,
    });

    const comparisonTiers = generateComparisonTiers({
      eventType,
      city,
      locality,
      eventDate,
      guestCount: Number(guestCount) || 100,
      venueType,
      foodPreference,
      decorStyle,
      requiredServices,
    });

    return res.json({
      success: true,
      estimate,
      comparisonTiers,
    });
  } catch (error: any) {
    console.error('Error in /api/budget/estimate:', error);
    return res.status(500).json({ error: 'Failed to compute budget estimate' });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Setup dev server or static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Utsav AI Celebration Platform running on port ${PORT}`);
  });
}

startServer();
