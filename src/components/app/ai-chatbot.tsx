import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, MessageSquare, Send, Bot, User, Car, MapPin, QrCode, AlertTriangle, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, store } from "@/lib/store";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { ReportIncidentModal } from "@/components/app/report-incident-modal";
import { FindMyCarModal } from "@/components/app/find-my-car-modal";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: number;
  action?: {
    type: "link" | "qr" | "report" | "find-car";
    payload?: string;
    label: string;
  };
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [showSetup, setShowSetup] = useState(() => !localStorage.getItem("gemini_api_key"));
  const [tempKey, setTempKey] = useState("");
  
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem("chatbot_history");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    return [];
  });
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { slots, bookings, users } = useStore();
  const currentUser = auth.getCurrentUser();
  const activeBookings = currentUser ? bookings.filter(b => b.userId === currentUser.id && b.status === "active") : [];
  const activeBooking = activeBookings.length > 0 ? activeBookings[0] : null;

  // Modal states for actions
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFindMyCarOpen, setIsFindMyCarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("chatbot_history", JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          id: "msg-welcome",
          text: "Hi there! I'm your SmartPark AI assistant 🚗.\n\nI can help you **find available slots**, **book parking**, or **locate your vehicle**.",
          sender: "ai",
          timestamp: Date.now(),
        }
      ]);
    }
  };

  const simulateAIResponse = async (userText: string) => {
    const availableSlots = slots.filter(s => s.status === "available");
    const evSlots = availableSlots.filter(s => s.isEV);
    
    const context = {
      availableSlots: availableSlots.length,
      evSlots: evSlots.length,
      activeBooking: activeBooking,
      walletBalance: currentUser ? users.find(u => u.id === currentUser.id)?.walletBalance : 0
    };

    try {
      const getBaseUrl = () => {
        if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          return `http://${window.location.hostname}:3001`;
        }
        return "http://localhost:3001";
      };
      
      const apiUrl = `${getBaseUrl()}/api/chat`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          message: userText,
          context,
          history: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) throw new Error("API Error");
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        text: data.text || "I processed your request.",
        sender: "ai",
        timestamp: Date.now(),
        action: data.action
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        text: "I'm sorry, I'm having trouble connecting to my brain right now. Ensure the backend server is running and the API key is set.",
        sender: "ai",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: input.trim(),
      sender: "user",
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    simulateAIResponse(userMessage.text);
  };

  const handleQuickAction = (text: string) => {
    setInput(text);
    // Simulate immediate form submission
    setTimeout(() => {
      const form = document.getElementById("chat-form") as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 10);
  };

  const handleActionClick = (action: Message["action"]) => {
    if (!action) return;
    
    if (action.type === "link" && action.payload) {
      setIsOpen(false);
      navigate({ to: action.payload as any });
    } else if (action.type === "qr" && activeBooking) {
      store.openTicket(activeBooking.id);
    } else if (action.type === "report") {
      setIsReportModalOpen(true);
    } else if (action.type === "find-car") {
      setIsFindMyCarOpen(true);
    }
  };

  // Helper to render basic markdown bold syntax
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempKey.trim()) return;
    localStorage.setItem("gemini_api_key", tempKey.trim());
    setApiKey(tempKey.trim());
    setShowSetup(false);
    
    // Add welcome message if chat is empty
    if (messages.length === 0) {
      setMessages([
        {
          id: "msg-welcome",
          text: "API Key saved successfully! I'm now fully connected. How can I help you today?",
          sender: "ai",
          timestamp: Date.now(),
        }
      ]);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setShowSetup(true);
    setTempKey("");
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          currentTranscript = finalTranscript;
        } else {
          currentTranscript = finalTranscript + event.results[i][0].transcript;
        }
      }
      setInput(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // We rely on a timeout to auto-send, or just let the user send it. 
      // Auto-sending immediately can be jarring if it cuts them off.
      // But we will auto-submit after a short delay if there is text.
      setTimeout(() => {
        const currentInput = document.getElementById('chat-input') as HTMLInputElement;
        if (currentInput && currentInput.value.trim().length > 0) {
          // Trigger the form submit programmatically
          document.getElementById('chat-submit-btn')?.click();
        }
      }, 1000);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const quickSuggestions = activeBooking 
    ? ["Where is my car?", "Show my QR pass", "Report an issue"]
    : ["Book parking", "Check rates", "Are there EV slots?"];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className="fixed bottom-[8.5rem] right-4 h-14 w-14 rounded-full shadow-glow bg-[linear-gradient(135deg,var(--primary),var(--secondary))] hover:scale-105 transition-transform z-50 p-0 md:bottom-28 md:right-6"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] glass-strong rounded-2xl flex flex-col shadow-elegant border border-white/10 z-50 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-black/40 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg text-primary border border-primary/30 shadow-glow">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">SmartPark Assistant</h3>
                <div className="text-[10px] text-success flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  AI is Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!showSetup && (
                <Button variant="ghost" size="icon" onClick={handleClearKey} title="Update API Key" className="h-8 w-8 hover:bg-white/10 rounded-full text-muted-foreground mr-1">
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setMessages([])} title="Clear Chat" className="h-8 w-8 hover:bg-white/10 rounded-full text-muted-foreground">
                <span className="text-xs">Clear</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-white/10 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showSetup ? (
            <div className="flex-1 flex flex-col p-6 items-center justify-center text-center animate-in fade-in zoom-in-95">
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/30 shadow-glow">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Your Brain</h3>
              <p className="text-sm text-muted-foreground mb-6">
                To enable the fully-fledged AI module, please provide your AI API Key (Gemini or Groq).
              </p>
              
              <form onSubmit={handleSaveKey} className="w-full flex flex-col gap-3">
                <Input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Enter API Key (Gemini or Groq)..."
                  className="bg-black/50 border-white/20 text-center"
                  required
                />
                <Button type="submit" className="w-full shadow-glow">
                  Activate AI Module
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground mt-4">
                Keys are stored securely in your browser's local storage and are never saved to our database.
              </p>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex w-full", msg.sender === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("flex gap-2 max-w-[85%]", msg.sender === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-auto", 
                    msg.sender === "user" ? "bg-white/10" : "bg-primary/20 text-primary border border-primary/30"
                  )}>
                    {msg.sender === "user" ? <User className="h-4 w-4 text-muted-foreground" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className={cn("rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm", 
                      msg.sender === "user" 
                        ? "bg-primary text-primary-foreground rounded-br-sm" 
                        : "bg-white/5 border border-white/10 text-foreground rounded-bl-sm"
                    )}>
                      {msg.sender === "ai" ? renderText(msg.text) : msg.text}
                    </div>
                    {/* Action Button if attached */}
                    {msg.action && (
                      <Button 
                        onClick={() => handleActionClick(msg.action)} 
                        variant="hero" 
                        size="sm" 
                        className="self-start rounded-xl shadow-glow text-xs px-4"
                      >
                        {msg.action.type === "find-car" && <MapPin className="h-3.5 w-3.5 mr-1.5" />}
                        {msg.action.type === "qr" && <QrCode className="h-3.5 w-3.5 mr-1.5" />}
                        {msg.action.type === "report" && <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />}
                        {msg.action.type === "link" && <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                        {msg.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex w-full justify-start">
                <div className="flex gap-2 max-w-[85%] flex-row">
                  <div className="shrink-0 h-7 w-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mt-auto">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-white/5 border border-white/10 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Smart Suggestions */}
          {!isTyping && messages[messages.length - 1]?.sender === "ai" && (
            <div className="px-3 pb-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {quickSuggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => handleQuickAction(s)}
                  className="text-xs bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/50 border border-white/10 rounded-full px-3 py-1.5 transition-all text-muted-foreground whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

              {/* Input Area */}
              <div className="p-3 bg-black/40 backdrop-blur-md border-t border-white/10 relative z-10">
                <form id="chat-form" onSubmit={handleSend} className="relative flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={toggleListening}
                    className={cn(
                      "h-11 w-11 rounded-full transition-all flex-shrink-0",
                      isListening 
                        ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500 animate-pulse border border-red-500/50" 
                        : "bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary border border-white/10"
                    )}
                  >
                    {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      id="chat-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isListening ? "Listening..." : "Ask me anything..."}
                      className="pr-12 bg-white/5 border-white/10 rounded-full h-11 focus-visible:ring-primary/50"
                    />
                    <Button 
                      id="chat-submit-btn"
                      type="submit" 
                      size="icon" 
                      variant="ghost" 
                      disabled={!input.trim()}
                      className="absolute right-1.5 top-1.5 h-8 w-8 rounded-full text-primary hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals triggered by Chatbot actions */}
      <ReportIncidentModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        defaultSlotNumber={activeBooking?.slotNumber} 
      />
      {activeBooking && (
        <FindMyCarModal 
          isOpen={isFindMyCarOpen} 
          onClose={() => setIsFindMyCarOpen(false)} 
          slotNumber={activeBooking.slotNumber} 
          floor={activeBooking.floor} 
        />
      )}
    </>
  );
}
