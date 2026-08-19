"use client";

import UnitPageLayout from "@/components/features/faskes/units/UnitPageLayout";

export default function RadiologiHistoryPage() {
  return (
    <UnitPageLayout
      unitKey="radiologi"
      unitTitle="Radiologi & Imaging Medis"
      unitSubtitle="Riwayat Temuan Pencitraan Radiologi & Hasil Ekspertise Dokter Radiolog"
      unitBadge="Radiologi & Pencitraan"
      themeColor={{
        bgGradient: "bg-gradient-to-r from-purple-800 via-purple-900 to-slate-950",
        badgeBg: "bg-purple-100 text-purple-950 border-purple-300",
        border: "border-purple-200",
        text: "text-purple-950",
      }}
      matchKeys={["radiologi", "imaging", "scan", "xray", "ctscan", "mri"]}
      defaultTab="riwayat"
    />
  );
}
