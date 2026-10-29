import React, { useState, useRef, useEffect } from 'react';
import { useEvents } from '../../context/EventContext';
import { AIChatMessage } from '../../types';
import { 
  Sparkles, Send, Bot, User, PlusCircle, CheckCircle, AlertCircle, 
  RefreshCw, DollarSign, CheckSquare, Bookmark, Flame
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Recommend a high-energy Sangeet timeline and performance sequence",
  "Is my catering budget allocation healthy for 350 guests in Ahmedabad?",
  "Draft a warm, emotional welcome speech outline for the bride's parents",
  "Design a weather contingency protocol for an outdoor cocktail evening",
  "Generate a 48-hour emergency kit checklist for bridal suites",
  "How should we structure late-night snack transitions after midnight?"
];

export const AIAssistantView: React.FC = () => {
  const { currentEvent, addTask, addBudgetItem, updateEvent, showToast, formatCurrency } = useEvents();

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Namaste! I am your **Utsav AI Celebration Strategist**.\n\nI have synchronized with **${currentEvent?.title || 'your celebration'}** (${currentEvent?.city || 'Gujarat'}, ${currentEvent?.guestCount || 350} guests). I can engineer custom timelines, sanity-check vendor budgets, draft formal speeches, and convert any recommendation directly into your master task checklist.\n\nWhat celebration detail shall we perfect today?`,
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          eventContext: {
            title: currentEvent?.title,
            eventType: currentEvent?.eventType,
            date: currentEvent?.date,
            city: currentEvent?.city,
            totalBudget: currentEvent?.totalBudget,
            guestCount: currentEvent?.guestCount,
            venue: currentEvent?.venue,
          },
          history: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: AIChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: data.reply || "I have prepared recommendations for your celebration based on luxury event standards.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat error:', err);
      // Fallback message
      const fallbackMessage: AIChatMessage = {
        id: 'assistant-fallback-' + Date.now(),
        role: 'assistant',
        content: `I've analyzed your celebration parameters for **${currentEvent?.title}**:\n\n1. **Timeline Recommendation**: Schedule bridal hair/makeup 4 hours prior to Baraat arrival.\n2. **Budget Rule of Thumb**: For luxury weddings, keep a 5–8% unallocated buffer for unexpected guest transit and late-night culinary stations.\n3. **Vendor Coordination**: Ensure your sound engineer does a sound check 90 minutes before acoustic artist entry.\n\n*Would you like to turn these into tasks or allocate budget lines?*`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Action helpers to turn AI response into real event artifacts
  const handleCreateTaskFromAI = (contentSnippet: string) => {
    const title = contentSnippet.length > 50 ? contentSnippet.slice(0, 47) + '...' : contentSnippet;
    addTask({
      title: `AI Task: ${title}`,
      category: 'General',
      priority: 'Medium',
      dueDate: currentEvent?.date || new Date().toISOString().split('T')[0],
      assignedTo: 'Planner Team',
      notes: `Generated via Utsav AI Assistant:\n"${contentSnippet}"`,
    });
    showToast('Task added to your Celebration Checklist!', 'success');
  };

  const handleSaveToNotes = (content: string) => {
    if (!currentEvent) return;
    const updatedNotes = currentEvent.notes 
      ? `${currentEvent.notes}\n\n--- AI Advisory (${new Date().toLocaleDateString()}) ---\n${content}`
      : `--- AI Advisory (${new Date().toLocaleDateString()}) ---\n${content}`;

    updateEvent(currentEvent.id, { notes: updatedNotes });
    showToast('Advisory saved to Event Master Notes', 'success');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-plum/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-plum">
              AI Planner
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/20 text-plum border border-gold/40 flex items-center gap-1">
              <Sparkles size={11} className="text-gold" />
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-xs md:text-sm text-plum/60 mt-1">
            Event planning advice for <strong className="text-plum font-semibold">{currentEvent?.title}</strong> ({formatCurrency(currentEvent?.totalBudget || 0)} budget)
          </p>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome-reset',
                role: 'assistant',
                content: `Chat session refreshed. How can I assist with **${currentEvent?.title}**?`,
                timestamp: new Date().toISOString()
              }
            ]);
            showToast('Conversation cleared', 'info');
          }}
          className="px-3 py-1.5 text-xs text-plum/60 hover:text-plum hover:bg-plum/5 rounded-lg border border-plum/15 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw size={13} />
          Reset Chat
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white rounded-2xl border border-plum/10 shadow-xs flex flex-col overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs ${
                  isUser 
                    ? 'bg-plum text-ivory-warm' 
                    : 'bg-gold/20 text-plum border border-gold/40'
                }`}>
                  {isUser ? <User size={15} /> : <Bot size={15} />}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-plum text-ivory-warm rounded-tr-none'
                      : 'bg-ivory-warm/70 text-plum border border-plum/10 rounded-tl-none'
                  }`}>
                    {/* Render content with basic markdown formatting */}
                    <div className="whitespace-pre-wrap space-y-2">
                      {message.content.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph.split('**').map((chunk, cIdx) => 
                            cIdx % 2 === 1 ? <strong key={cIdx} className="font-semibold">{chunk}</strong> : chunk
                          )}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Actions for Assistant messages */}
                  {!isUser && message.id !== 'welcome-msg' && (
                    <div className="flex flex-wrap items-center gap-2 mt-2 ml-1 text-xs text-plum/70">
                      <button
                        onClick={() => handleCreateTaskFromAI(message.content.slice(0, 80))}
                        className="px-2.5 py-1 bg-white hover:bg-ivory-warm border border-plum/15 rounded-md text-[11px] font-medium text-plum transition-all flex items-center gap-1 shadow-2xs"
                      >
                        <CheckSquare size={12} className="text-terracotta" />
                        Turn into Task
                      </button>

                      <button
                        onClick={() => handleSaveToNotes(message.content)}
                        className="px-2.5 py-1 bg-white hover:bg-ivory-warm border border-plum/15 rounded-md text-[11px] font-medium text-plum transition-all flex items-center gap-1 shadow-2xs"
                      >
                        <Bookmark size={12} className="text-gold" />
                        Save to Event Notes
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] text-plum/40 mt-1 px-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-full bg-gold/20 text-plum border border-gold/40 flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
              <div className="p-4 rounded-2xl bg-ivory-warm/70 border border-plum/10 rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-plum/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-plum/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-plum/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-plum/60 ml-2 font-medium">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Inquiries */}
        <div className="p-3 bg-ivory-warm/30 border-t border-plum/10 overflow-x-auto flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-plum/50 uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
            <Sparkles size={11} className="text-gold" />
            Advisory:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 bg-white hover:bg-ivory-warm border border-plum/15 rounded-md text-plum whitespace-nowrap transition-colors shadow-2xs shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 md:p-4 bg-white border-t border-plum/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask anything about ${currentEvent?.title || 'your celebration'} (timelines, rituals, hospitality, budgeting)...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-ivory-warm/50 border border-plum/20 rounded-xl focus:outline-none focus:border-plum text-plum placeholder:text-plum/40 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-5 py-2.5 bg-plum text-ivory-warm font-semibold text-xs md:text-sm rounded-xl hover:bg-plum-light transition-all flex items-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={15} />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
