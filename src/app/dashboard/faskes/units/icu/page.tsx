"use client";

import UnitPageLayout from "@/components/features/faskes/units/UnitPageLayout";

export default function IcuUnitPage() {
  return (
    <UnitPageLayout
      unitKey="icu"
      unitTitle="Intensive Care Unit (ICU)"
      unitSubtitle="Perawatan Intensif Pasien Kritis, Monitoring Vital Signs, Ventilator & Observasi Kritis"
      unitBadge="Intensive Care & Monitoring"
      themeColor={{
        bgGradient: "bg-gradient-to-r from-rose-800 via-rose-900 to-slate-950",
        badgeBg: "bg-rose-100 text-rose-950 border-rose-300",
        border: "border-rose-200",
        text: "text-rose-950",
      }}
      matchKeys={["icu", "intensive", "kritis"]}
    />
  );
}
