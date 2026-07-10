import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, HelpCircle, ArrowRight } from 'lucide-react';

interface AIHelperProps {
  currentRole: string;
  userName: string;
  schoolName?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AIHelper({ currentRole, userName, schoolName = 'My School' }: AIHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello ${userName}! Welcome to the **${currentRole.replace('_', ' ').toUpperCase()}** portal. How can I help you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [schoolName, currentRole, userName, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const getSuggestions = () => {
    switch (currentRole) {
      case 'student':
        return [
          'How do I check my grades?',
          'View my timetable',
          'My tuition balance',
        ];
      case 'teacher':
        return [
          'How to add grades?',
          'View my students',
          'Take attendance',
        ];
      case 'parent':
        return [
          'View my children',
          'Make a payment',
          'Contact school',
        ];
      default:
        return [
          'How to use this portal?',
          'View reports',
          'School information',
        ];
    }
  };

  // Remove AI API call - just show helpful responses
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    const newMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
    setIsLoading(true);

    // Simulate a helpful response (no AI API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        'grade': 'You can view your grades in the "Grades" tab. Click on any grade to see detailed feedback.',
        'payment': 'Payments can be made through the "Tuition" section or by clicking the "Make Payment" button.',
        'student': 'Student information is available in the main dashboard. Click on a student to view details.',
        'help': 'I can help you navigate the system. What would you like to know about?',
      };

      let reply = 'I\'m here to help you navigate the school management system. Could you please rephrase your question?';

      const lowerText = textToSend.toLowerCase();
      for (const [key, value] of Object.entries(responses)) {
        if (lowerText.includes(key)) {
          reply = value;
          break;
        }
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 border border-slate-700/50"
        title="Open Assistant"
      >
        <Sparkles className="h-6 w-6 text-emerald-400" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] text-white font-bold items-center justify-center">AI</span>
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-55 bg-black/40 backdrop-blur-xs" onClick={() => setIsOpen(false)} />
      )}

      <div
        className={`fixed top-0 right-0 z-55 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 text-white border-b border-slate-850">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <Bot className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                {schoolName} Assistant
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {currentRole.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border text-xs font-semibold ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`flex flex-col space-y-1`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 self-end px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-600">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-white text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span className="text-xs text-slate-400 italic">Typing...</span>
              </div>
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div className="px-6 py-3 bg-white border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <HelpCircle className="h-3 w-3" /> Quick Help:
            </p>
            <div className="flex flex-col gap-1.5">
              {getSuggestions().map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="w-full text-left text-xs bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 text-slate-600 hover:text-emerald-700 rounded-lg px-3 py-2 transition-all flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{s}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-emerald-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(message)}
              placeholder="Ask anything..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend(message)}
              disabled={!message.trim() || isLoading}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white p-2.5 transition-colors"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Offline Assistant - No API required
          </p>
        </div>
      </div>
    </>
  );
}