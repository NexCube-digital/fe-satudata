"use client";

import UnitPageLayout from "@/components/features/faskes/units/UnitPageLayout";

export default function IcuHistoryPage() {
  return (
    <UnitPageLayout
      unitKey="icu"
      unitTitle="Intensive Care Unit (ICU)"
      unitSubtitle="Riwayat Catatan Perawatan Kritis ICU & Observasi Intensif Terenkripsi"
      unitBadge="Intensive Care & Monitoring"
      themeColor={{
        bgGradient: "bg-gradient-to-r from-rose-800 via-rose-900 to-slate-950",
        badgeBg: "bg-rose-100 text-rose-950 border-rose-300",
        border: "border-rose-200",
        text: "text-rose-950",
      }}
      matchKeys={["icu", "intensive", "kritis"]}
      defaultTab="riwayat"
    />
  );
}
