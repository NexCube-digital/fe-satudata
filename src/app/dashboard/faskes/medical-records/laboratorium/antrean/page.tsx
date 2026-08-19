"use client";

import UnitPageLayout from "@/components/features/faskes/units/UnitPageLayout";

export default function LaboratoriumAntreanPage() {
  return (
    <UnitPageLayout
      unitKey="laboratorium"
      unitTitle="Laboratorium Medis"
      unitSubtitle="Permintaan Sampel Darah & Urine, Pemeriksaan Patologi Klinik"
      unitBadge="Patologi & Laboratorium"
      themeColor={{
        bgGradient: "bg-gradient-to-r from-blue-800 via-blue-900 to-slate-950",
        badgeBg: "bg-blue-100 text-blue-950 border-blue-300",
        border: "border-blue-200",
        text: "text-blue-950",
      }}
      matchKeys={["lab", "laboratorium", "sample", "pemeriksaan"]}
      defaultTab="antrean"
    />
  );
}
