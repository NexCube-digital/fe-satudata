"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, RotateCcw, Send, Sparkles, User } from "lucide-react";
import { apiPost } from "@/lib/api";

// Pertanyaan contoh yang bisa langsung diklik user saat chat masih kosong
const SUGGESTED_QUESTIONS = [
	"Bagaimana cara kerja persetujuan akses rekam medis?",
	"Apakah data saya aman dan terenkripsi?",
	"Siapa saja yang bisa melihat rekam medis saya?",
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

export default function AiPage({ mode = "system", patientId = "" }) {
	const isMedicalChat = mode === "medical";
	const [sessionId] = useState(createSessionId);
	const [question, setQuestion] = useState("");
	const [messages, setMessages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [lastFailedQuestion, setLastFailedQuestion] = useState("");

	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);

	// Auto-scroll ke pesan terbaru setiap kali ada pesan baru atau saat loading
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isLoading]);

	const askQuestion = async (trimmedQuestion) => {
		setError("");
		const normalizedPatientId = patientId === null || patientId === undefined ? "" : String(patientId).trim();
		if (isMedicalChat && !normalizedPatientId) {
			setError("Identitas pasien belum siap. Silakan tutup lalu buka kembali Tanya AI.");
			return;
		}
		setMessages((current) => [...current, { role: "user", content: trimmedQuestion }]);
		setIsLoading(true);

		try {
			const result = await apiPost(
				isMedicalChat ? "/api/ai/chat" : "/api/ai/system-chat",
				isMedicalChat
					? { action: "medical", patient_id: normalizedPatientId, question: trimmedQuestion, top_k: 5 }
					: { session_id: sessionId, question: trimmedQuestion, top_k: 4 }
			);
			setMessages((current) => [...current, { role: "assistant", content: getAnswer(result) }]);
			setLastFailedQuestion("");
		} catch (requestError) {
			setError(requestError.message || "Chatbot sedang tidak dapat dihubungi.");
			setLastFailedQuestion(trimmedQuestion);
			// Pertanyaan yang gagal tetap tampil di daftar chat sebagai jejak,
			// tapi tidak otomatis dihapus agar user tahu pesan mana yang belum terjawab
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
		// Enter mengirim pesan, Shift+Enter membuat baris baru
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

	return (
		<section className="overflow-hidden rounded-3xl border border-teal-200 bg-white shadow-sm">
			<div className="border-b border-teal-100 bg-[#E6F4F1] p-6 sm:p-8">
				<div className="flex items-start justify-between gap-4">
					<div>
						<div className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0D9488]">
							<Sparkles className="h-4 w-4" />
							{isMedicalChat ? "Asisten rekam medis" : "Tanya langsung tentang sistem"}
						</div>
						<h2 className="text-xl font-extrabold text-[#334155] sm:text-2xl">
							{isMedicalChat ? "Tanya tentang rekam medis" : "Masih bingung dengan SatuData?"}
						</h2>
						<p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#64748B] sm:text-sm">
							{isMedicalChat
								? "Dapatkan penjelasan berdasarkan rekam medis yang dapat Anda akses."
								: "Tanyakan cara kerja platform, keamanan data, integrasi, atau fitur lainnya kepada chatbot sistem kami."}
						</p>
					</div>
					{messages.length > 0 && (
						<button
							type="button"
							onClick={resetChat}
							title="Mulai percakapan baru"
							aria-label="Mulai percakapan baru"
							className="rounded-xl border border-teal-200 bg-white p-2 text-[#0D9488] transition hover:bg-teal-50"
						>
							<RotateCcw className="h-4 w-4" />
						</button>
					)}
				</div>
			</div>

			<div className="space-y-3 p-4 sm:p-6">
				{messages.length === 0 && (
					<div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
						<p className="mb-4 text-xs text-slate-500">Contoh pertanyaan yang bisa kamu tanyakan:</p>
						<div className="flex flex-wrap justify-center gap-2">
							{(isMedicalChat
								? ["Apa saja isi rekam medis saya?", "Jelaskan riwayat diagnosis saya", "Apa arti hasil pemeriksaan saya?"]
								: SUGGESTED_QUESTIONS
							).map((suggestion) => (
								<button
									key={suggestion}
									type="button"
									onClick={() => askQuestion(suggestion)}
									className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs text-[#0D9488] transition hover:bg-teal-50"
								>
									{suggestion}
								</button>
							))}
						</div>
					</div>
				)}

				{messages.map((message, index) => {
					const isUser = message.role === "user";
					return (
						<div key={`${message.role}-${index}`} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
							{!isUser && (
								<div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10">
									<Bot className="h-4 w-4 text-[#0D9488]" />
								</div>
							)}
							<div
								className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
									isUser ? "bg-[#0D9488] text-white" : "bg-slate-100 text-[#334155]"
								}`}
							>
								{message.content}
							</div>
							{isUser && (
								<div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
									<User className="h-4 w-4 text-slate-400" />
								</div>
							)}
						</div>
					);
				})}

				{isLoading && (
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10">
							<Bot className="h-4 w-4 text-[#0D9488]" />
						</div>
						<LoaderCircle className="h-4 w-4 animate-spin text-[#0D9488]" />
						Chatbot sedang menyiapkan jawaban...
					</div>
				)}

				{/* Anchor kosong untuk auto-scroll ke bagian bawah chat */}
				<div ref={messagesEndRef} />

				{error && (
					<div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
						<span>{error}</span>
						{lastFailedQuestion && (
							<button
								type="button"
								onClick={retryLastQuestion}
								className="shrink-0 rounded-lg border border-red-200 bg-white px-2 py-1 font-semibold text-red-600 transition hover:bg-red-100"
							>
								Coba lagi
							</button>
						)}
					</div>
				)}

				<form onSubmit={sendQuestion} className="flex items-end gap-2 border-t border-slate-100 pt-4">
					<textarea
						ref={textareaRef}
						value={question}
						onChange={(event) => setQuestion(event.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={`Tulis pertanyaan tentang ${isMedicalChat ? "rekam medis" : "sistem"}... (Enter untuk kirim, Shift+Enter untuk baris baru)`}
						aria-label={`Pertanyaan untuk chatbot ${isMedicalChat ? "rekam medis" : "sistem"}`}
						maxLength={4000}
						rows={1}
						className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
					/>
					<button
						type="submit"
						disabled={!question.trim() || isLoading}
						title="Tanya AI"
						aria-label="Tanya AI"
						className="shrink-0 rounded-xl bg-[#0D9488] px-4 py-3 text-white transition hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
					</button>
				</form>
			</div>
		</section>
	);
}