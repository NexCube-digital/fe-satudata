"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function FaskesFinanceIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/faskes/finance/pelayanan-medis");
  }, [router]);

  return (
    <div className="space-y-6">
      <RefreshCw className="h-8 w-8 animate-spin text-teal-800" />
    </div>
  );
}
