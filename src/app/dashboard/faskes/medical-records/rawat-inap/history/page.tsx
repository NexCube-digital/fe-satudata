"use client";

import UnitPageLayout from "@/components/features/faskes/units/UnitPageLayout";

export default function RawatInapHistoryPage() {
  return (
    <UnitPageLayout
      unitKey="rawat-inap"
      unitTitle="Perawatan Rawat Inap (Bangsal)"
      unitSubtitle="Riwayat Rekam Medis & Ringkasan Pulang (Discharge Summary) Rawat Inap"
      unitBadge="Perawatan Bangsal Ranap"
      themeColor={{
        bgGradient: "bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-950",
        badgeBg: "bg-indigo-100 text-indigo-950 border-indigo-300",
        border: "border-indigo-200",
        text: "text-indigo-950",
      }}
      matchKeys={["rawat_inap", "ranap", "bangsal"]}
      defaultTab="riwayat"
    />
  );
}
