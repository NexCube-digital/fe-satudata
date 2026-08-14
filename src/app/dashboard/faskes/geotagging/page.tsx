"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FaskesGeotaggingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/faskes");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-xs text-slate-500 font-medium">
      Mengalihkan...
    </div>
  );
}
