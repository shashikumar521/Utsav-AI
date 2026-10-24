import express, { Request, Response } from 'express';
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
  const eventName = eventContext?.name || 'your celebration';
  const eventBudget = eventContext?.budget || 600000;
  const guestCount = eventContext?.guestCount || 120;
  const location = eventContext?.location || 'India';

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
- Name: ${eventContext?.name || 'Celebration'}
- Type: ${eventContext?.type || 'Event'}
- Date: ${eventContext?.date || 'Upcoming'}
- Location: ${eventContext?.location || 'India'}
- Guests: ${eventContext?.guestCount || 100}
- Budget: ₹${eventContext?.budget ? Number(eventContext.budget).toLocaleString('en-IN') : '5,00,000'}

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
          model: 'gemini-2.5-flash',
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
          model: 'gemini-2.5-flash',
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
