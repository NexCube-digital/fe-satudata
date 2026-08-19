"use client";

import UnitPageLayout from "@/components/features/faskes/units/UnitPageLayout";

export default function RadiologiUnitPage() {
  return (
    <UnitPageLayout
      unitKey="radiologi"
      unitTitle="Radiologi & Imaging Medis"
      unitSubtitle="Permintaan Radiografi X-Ray, Ultrasonografi (USG), CT-Scan, MRI & Ekspertise Radiolog"
      unitBadge="Radiologi & Pencitraan"
      themeColor={{
        bgGradient: "bg-gradient-to-r from-purple-800 via-purple-900 to-slate-950",
        badgeBg: "bg-purple-100 text-purple-950 border-purple-300",
        border: "border-purple-200",
        text: "text-purple-950",
      }}
      matchKeys={["radiologi", "imaging", "scan", "xray", "ctscan", "mri"]}
    />
  );
}
