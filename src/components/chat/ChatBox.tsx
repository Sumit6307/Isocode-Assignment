"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, PhoneCall, ShieldCheck, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SlotPicker } from "@/components/chat/SlotPicker";

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
  showSlotPicker?: boolean;
}

interface ChatBoxProps {
  initialLeadId?: string;
  initialProjectId?: string;
  isWidget?: boolean;
  onClose?: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  initialLeadId,
  initialProjectId,
  isWidget = false,
  onClose,
}) => {
  const [leadId, setLeadId] = useState<string>(initialLeadId || "");
  const [sessionId, setSessionId] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isHandedOff, setIsHandedOff] = useState<boolean>(false);
  const [showSlotPicker, setShowSlotPicker] = useState<boolean>(false);

  // Buyer capture state if no initial lead ID is given
  const [buyerName, setBuyerName] = useState<string>("");
  const [buyerPhone, setBuyerPhone] = useState<string>("");
  const [buyerWants, setBuyerWants] = useState<string>("3 BHK");
  const [leadCreated, setLeadCreated] = useState<boolean>(!!initialLeadId);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! Welcome to **Company A Ahmedabad**. I am your AI concierge for **Shubh Residency (Shela)** and **Aarambh Heights (Bopal)**. 🏠\n\nHow can I assist you with your home search today?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showSlotPicker, loading]);

  // Handle lead registration before chat if user is anonymous
  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone) return;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: buyerName,
          phone: buyerPhone,
          wants: buyerWants,
          source: "website",
          projectId: initialProjectId || undefined,
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setLeadId(data.data.id);
        setLeadCreated(true);
      }
    } catch (err) {
      console.error("Failed to register lead:", err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading || !leadId) return;

    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // If query asks for booking, show slot picker immediately
    const lower = query.toLowerCase();
    if (lower.includes("book") || lower.includes("visit") || lower.includes("slot")) {
      setShowSlotPicker(true);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          leadId,
          message: query,
          language,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (!sessionId && data.sessionId) {
          setSessionId(data.sessionId);
        }

        if (data.status === "HANDED_OFF") {
          setIsHandedOff(true);
        }

        // Add assistant message
        const reply = data.messages[data.messages.length - 1];
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: reply.content,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I apologize, our connection experienced a momentary delay. Please ask again or feel free to request a sales executive.",
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm currently having trouble reaching the server. A sales executive has been notified to assist you directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: "💰 2 & 3 BHK Prices", query: "What are the price ranges for 2 and 3 BHK apartments?" },
    { label: "📅 Book a Site Visit", query: "I want to book a site visit" },
    { label: "🏊 Project Amenities", query: "What amenities are offered at Shubh Residency and Aarambh Heights?" },
    { label: "📍 Locations & Connectivity", query: "Where are the projects located?" },
    { label: "👤 Talk to a Sales Executive", query: "Please connect me to a human sales executive" },
  ];

  return (
    <div className="flex flex-col h-full bg-stone-50 border border-stone-200 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-stone-900 text-white p-3.5 px-4 flex items-center justify-between border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-600/90 flex items-center justify-center text-white ring-2 ring-teal-400/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm tracking-tight text-white">
                Company A Assistant
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-stone-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              Verified RERA Fact Sheet • Instant Response
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
            <Globe className="w-3 h-3 text-stone-400 ml-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-[11px] text-stone-200 py-1 pl-1 pr-2 outline-none cursor-pointer"
            >
              <option value="en" className="bg-stone-900 text-white">English</option>
              <option value="hi" className="bg-stone-900 text-white">हिंदी (Hindi)</option>
              <option value="gu" className="bg-stone-900 text-white">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          {isWidget && onClose && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded-md text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* RERA Notice Bar */}
      <div className="bg-stone-100 border-b border-stone-200 px-4 py-1 text-[11px] text-stone-600 flex items-center justify-between">
        <span>RERA: PR/GJ/AHMEDABAD/RAA10000 & RAA10001</span>
        <span className="text-teal-700 font-medium">Ahmedabad West</span>
      </div>

      {/* Content Area */}
      {!leadCreated ? (
        <div className="flex-1 p-6 flex flex-col justify-center items-center bg-white">
          <div className="max-w-xs w-full text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-stone-900 text-base mb-1">
              Find Your Dream Home
            </h4>
            <p className="text-xs text-stone-500 mb-5">
              Enter your contact to receive real-time unit pricing and instant site-visit booking confirmations.
            </p>

            <form onSubmit={handleStartConversation} className="space-y-3 text-left">
              <div>
                <label className="text-xs font-medium text-stone-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hardik Patel"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700">Phone Number (DPDP Protected)</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00001"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700">Interested In</label>
                <select
                  value={buyerWants}
                  onChange={(e) => setBuyerWants(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                >
                  <option value="2 BHK">2 BHK (₹65L - ₹85L)</option>
                  <option value="3 BHK">3 BHK (₹82L - ₹1.2Cr)</option>
                  <option value="Both">Both 2 & 3 BHK</option>
                </select>
              </div>

              <Button type="submit" fullWidth size="md" className="mt-2">
                Start AI Consultation
              </Button>

              <p className="text-[10px] text-stone-400 text-center">
                Under DPDP Act 2023, your number is kept private & used only for site visit updates.
              </p>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/50">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            const isSystem = m.role === "system";

            if (isSystem) {
              return (
                <div
                  key={idx}
                  className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs text-center my-2 font-medium"
                >
                  {m.content}
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1 shadow-xs">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? "bg-teal-700 text-white rounded-br-xs"
                      : "bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs"
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Show interactive Slot Picker if requested */}
          {showSlotPicker && leadId && (
            <SlotPicker
              leadId={leadId}
              projectId={initialProjectId}
              onBookingSuccess={(bookingData) => {
                setShowSlotPicker(false);
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: `🎉 Outstanding! Your site visit is confirmed for **${bookingData.project?.name}** on **${bookingData.slot.date}** at **${bookingData.slot.startTime}**.\n\n📍 Location Pin: ${bookingData.project?.address || bookingData.project?.location}\n\nOur team will welcome you at the reception. Automated 24-hour and 2-hour reminders have been scheduled to your phone.`,
                  },
                ]);
              }}
            />
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-2.5 items-center text-stone-400 text-xs pl-2">
              <Bot className="w-4 h-4 text-teal-700 animate-pulse" />
              <div className="flex gap-1 items-center bg-white border border-stone-200 px-3 py-2 rounded-xl">
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Quick Suggestion Chips */}
      {leadCreated && (
        <div className="px-3 pt-2 pb-1 bg-white border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              disabled={loading}
              className="shrink-0 px-2.5 py-1 text-[11px] bg-stone-100 hover:bg-teal-50 hover:text-teal-800 text-stone-700 rounded-full border border-stone-200 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      {leadCreated && (
        <div className="p-3 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === "hi"
                  ? "सवाल पूछें या 'साइट विज़िट बुक करें' लिखें..."
                  : language === "gu"
                  ? "પ્રશ્ન પૂછો અથવા 'સાઇટ મુલાકાત બુક કરો' લખો..."
                  : "Ask about price, amenities, or 'Book a site visit'..."
              }
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 focus:bg-white transition-all text-stone-900"
            />
            <Button
              type="submit"
              size="md"
              disabled={!input.trim() || loading}
              className="rounded-xl px-3.5"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[10px] text-stone-400 px-1">
            <span>Official Fact Sheet Verified • No estimated prices</span>
            <button
              type="button"
              onClick={() => handleSendMessage("Connect me to a human executive")}
              className="text-teal-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <PhoneCall className="w-2.5 h-2.5" /> Talk to Human
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
