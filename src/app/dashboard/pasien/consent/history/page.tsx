"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function RedirectConsentHistory() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/pasien/history?tab=consent");
  }, [router]);

  return (
    <div className="space-y-6">
      <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
    </div>
  );
}
