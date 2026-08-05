"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PharmacyOverviewRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/faskes");
  }, [router]);

  return null;
}
