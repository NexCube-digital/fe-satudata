"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Bot, 
  LoaderCircle, 
  RotateCcw, 
  Send, 
  Sparkles, 
  User, 
  X, 
  ShieldCheck, 
  Lock, 
  Stethoscope, 
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

// Suggested questions with icons (Halodoc HILDA Style)
const SYSTEM_SUGGESTIONS = [
  {
    icon: ShieldCheck,
    iconColor: "text-emerald-500 bg-emerald-50 border-emerald-100",
    text: "Apakah data medis saya aman dan terenkripsi AES-256?",
  },
  {
    icon: Lock,
    iconColor: "text-teal-600 bg-teal-50 border-teal-100",
    text: "Bagaimana cara kerja persetujuan akses rekam medis?",
  },
  {
    icon: Stethoscope,
    iconColor: "text-cyan-600 bg-cyan-50 border-cyan-100",
    text: "Siapa saja yang bisa melihat rekam medis saya?",
  },
];

const MEDICAL_SUGGESTIONS = [
  {
    icon: Stethoscope,
    iconColor: "text-teal-600 bg-teal-50 border-teal-100",
    text: "Apa saja isi ringkasan rekam medis saya?",
  },
  {
    icon: ShieldCheck,
    iconColor: "text-emerald-500 bg-emerald-50 border-emerald-100",
    text: "Jelaskan riwayat diagnosis medis terbaru saya",
  },
  {
    icon: HelpCircle,
    iconColor: "text-cyan-600 bg-cyan-50 border-cyan-100",
    text: "Apa rekomendasi dokter pada kunjungan terakhir?",
  },
];

function createSessionId() {
  if (typeof window === "undefined") return "faq-session";
  const storedSessionId = window.sessionStorage.getItem("faq-ai-session-id");
  if (storedSessionId) return storedSessionId;

  const sessionId = window.crypto?.randomUUID?.() || `faq-${Date.now()}`;
  window.sessionStorage.setItem("faq-ai-session-id", sessionId);
  return sessionId;
}

function getAnswer(result) {
  return (
    result?.answer ||
    result?.response ||
    result?.message ||
    result?.data?.answer ||
    result?.data?.response ||
    "Maaf, saya belum menerima jawaban dari layanan AI."
  );
}

async function loadMedicalData() {
  const historyResult = await apiGet("/api/patient/history");
  const history = Array.isArray(historyResult?.data) ? historyResult.data : [];

  const records = await Promise.all(
    history.map(async (record) => {
      try {
        const detailResult = await apiGet(`/api/patient/history/${record.id}`);
        return detailResult?.data ? { ...record, detail: detailResult.data } : record;
      } catch {
        return record;
      }
    })
  );

  return { records };
}

export default function AiPage({ 
  mode = "system", 
  patientId = "", 
  onClose = null,
  isFloating = false
}) {
  const isMedicalChat = mode === "medical";
  const [sessionId] = useState(createSessionId);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [medicalData, setMedicalData] = useState(null);
  const [error, setError] = useState("");
  const [lastFailedQuestion, setLastFailedQuestion] = useState("");
  const [sessionStartTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isMedicalChat || !String(patientId || "").trim()) return;

    let cancelled = false;
    loadMedicalData()
      .then((data) => {
        if (!cancelled) setMedicalData(data);
      })
      .catch(() => {
        if (!cancelled) setMedicalData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isMedicalChat, patientId]);

  const askQuestion = async (trimmedQuestion) => {
    setError("");
    const normalizedPatientId = patientId === null || patientId === undefined ? "" : String(patientId).trim();
    if (isMedicalChat && !normalizedPatientId) {
      setError("Identitas pasien belum siap. Silakan tutup lalu buka kembali Tanya AI.");
      return;
    }

    let contextData = medicalData;
    if (isMedicalChat && !contextData) {
      try {
        contextData = await loadMedicalData();
        setMedicalData(contextData);
      } catch {
        contextData = null;
      }
    }

    setMessages((current) => [...current, { role: "user", content: trimmedQuestion }]);
    setIsLoading(true);

    try {
      const result = await apiPost(
        isMedicalChat ? "/api/ai/chat" : "/api/ai/system-chat",
        isMedicalChat
          ? {
              action: "medical",
              patient_id: normalizedPatientId,
              question: trimmedQuestion,
              top_k: 5,
              medical_data: contextData || undefined,
            }
          : { session_id: sessionId, question: trimmedQuestion, top_k: 4 }
      );
      setMessages((current) => [...current, { role: "assistant", content: getAnswer(result) }]);
      setLastFailedQuestion("");
    } catch (requestError) {
      setError(requestError.message || "Chatbot sedang tidak dapat dihubungi.");
      setLastFailedQuestion(trimmedQuestion);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const sendQuestion = (event) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setQuestion("");
    askQuestion(trimmedQuestion);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendQuestion(event);
    }
  };

  const retryLastQuestion = () => {
    if (!lastFailedQuestion || isLoading) return;
    const questionToRetry = lastFailedQuestion;
    setLastFailedQuestion("");
    askQuestion(questionToRetry);
  };

  const resetChat = () => {
    setMessages([]);
    setQuestion("");
    setError("");
    setLastFailedQuestion("");
  };

  const suggestions = isMedicalChat ? MEDICAL_SUGGESTIONS : SYSTEM_SUGGESTIONS;

  return (
    <div className={`flex flex-col bg-white overflow-hidden ${
      isFloating 
        ? "h-full w-full" 
        : "rounded-3xl border border-teal-100 shadow-xl max-h-[640px]"
    }`}>
      
      {/* HEADER HALODOC HILDA STYLE */}
      <div className="relative border-b border-slate-100 bg-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              title="Tutup Chat"
              aria-label="Tutup Chat"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Halodoc HILDA Logo Badge */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#0D9488] via-[#0F766E] to-teal-500 shadow-md ring-2 ring-teal-500/20">
              <Stethoscope className="h-5 w-5 text-white" />
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-[#0D9488]">SADA</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">by SatuData AI</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold text-emerald-600">Online 24/7 • Asisten Cerdas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Chat Button */}
        {messages.length > 0 && (
          <button
            type="button"
            onClick={resetChat}
            title="Mulai ulang sesi chat"
            aria-label="Mulai ulang sesi chat"
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-teal-50 hover:text-[#0D9488] hover:border-teal-200 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* CHAT BODY CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* Empty State Welcome & Topic Pill Cards (Halodoc HILDA Style) */}
        {messages.length === 0 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="text-center px-2 pt-2">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {isMedicalChat
                  ? "Halo! SADA siap memandumu memahami data rekam medis secara aman & terenkripsi."
                  : "Halo! SADA siap memandumu soal layanan, keamanan AES-256, dan integrasi SatuData."}
              </p>
              <p className="mt-2 text-xs font-bold text-[#334155]">
                Mau mulai? Tanya saja atau pilih topik berikut.
              </p>
            </div>

            {/* Topic Suggestion Buttons Cards */}
            <div className="space-y-2 pt-1">
              {suggestions.map((s, idx) => {
                const IconComp = s.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => askQuestion(s.text)}
                    className="w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 text-left text-xs font-bold text-slate-700 shadow-2xs hover:border-teal-300 hover:bg-teal-50/40 hover:shadow-md transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${s.iconColor}`}>
                        <IconComp className="h-4 w-4" />
                      </div>
                      <span className="line-clamp-2 leading-snug group-hover:text-[#0D9488]">{s.text}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#0D9488] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Info Session Alert Box (Halodoc HILDA Style) */}
            <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-3.5 text-[11px] text-sky-950 flex items-start gap-2.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200/80 text-sky-700">
                <User className="h-3 w-3" />
              </div>
              <div className="leading-relaxed">
                <p className="font-semibold">Sesi kamu aktif sejak pukul {sessionStartTime}.</p>
                <p className="text-sky-700 mt-0.5 text-[10px]">
                  Percakapan ini ditangani secara privat & terenkripsi oleh AI SatuData.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div key={`${message.role}-${index}`} className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}>
              {!isUser && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#0D9488] to-teal-500 text-white shadow-2xs">
                  <Stethoscope className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser 
                    ? "bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white shadow-sm rounded-tr-xs" 
                    : "bg-slate-100 text-slate-800 border border-slate-200/60 rounded-tl-xs"
                }`}
              >
                {message.content}
              </div>
              {isUser && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs text-slate-500 animate-pulse pt-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#0D9488] to-teal-500 text-white">
              <Stethoscope className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="rounded-2xl bg-slate-100 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-600 flex items-center gap-2">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#0D9488]" />
              SADA sedang memikirkan jawaban...
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            <span>{error}</span>
            {lastFailedQuestion && (
              <button
                type="button"
                onClick={retryLastQuestion}
                className="shrink-0 rounded-xl bg-white border border-rose-200 px-3 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
              >
                Coba lagi
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER INPUT BAR (Halodoc HILDA Style Capsule Input) */}
      <div className="border-t border-slate-100 bg-white p-3.5 shrink-0 space-y-1.5">
        <form onSubmit={sendQuestion} className="relative flex items-center">
          <input
            ref={textareaRef}
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanyakan apa saja..."
            aria-label="Tanyakan apa saja"
            maxLength={500}
            className="w-full rounded-full border border-slate-200 bg-slate-100/90 pl-4 pr-12 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 shadow-inner"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            title="Kirim pesan"
            aria-label="Kirim pesan"
            className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
          >
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </form>

        <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
          <span>SADA by SatuData AI</span>
          <span className="font-mono">{question.length}/500</span>
        </div>
      </div>

    </div>
  );
}