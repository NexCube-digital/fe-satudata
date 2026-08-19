"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyNonMedisSubLayananPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/faskes/finance/nonmedis/layanannonmedis");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
      Mengalihkan ke halaman layanan non medis...
    </div>
  );
}
