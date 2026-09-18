"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, MessageCircle } from "lucide-react";
import AiPage from "@/components/landing/faq/AiPage";

function getNormalizedRole(user) {
  const role = String(user?.role || "").trim().toLowerCase();
  if (["pasien", "patient"].includes(role)) return "pasien";
  if (["rs", "rumah_sakit", "faskes", "dokter"].includes(role)) return "rs";
  return "";
}

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch {
        setUser(null);
      } finally {
        setIsReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-teal-700">
        <LoaderCircle className="h-6 w-6 animate-spin" aria-label="Memuat chat" />
      </main>
    );
  }

  const userRole = getNormalizedRole(user);
  const userId = user?.user_id || user?.userId || user?.id || "";
  const patientId = userRole === "pasien"
    ? user?.patient_id || user?.patientId || user?.patient?.id || userId
    : "";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col justify-center">
        <div className="mb-4 flex items-center gap-2 text-teal-700">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-extrabold tracking-wide">SADA Chat</span>
        </div>
        <AiPage
          mode="medical"
          enableClassification
          patientId={patientId}
          userRole={userRole}
          userId={userId}
        />
      </div>
    </main>
  );
}
