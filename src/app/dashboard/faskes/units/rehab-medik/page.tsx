"use client";

import UnitPageLayout from "@/components/features/faskes/units/UnitPageLayout";

export default function RehabMedikUnitPage() {
  return (
    <UnitPageLayout
      unitKey="rehab-medik"
      unitTitle="Pelayanan Rehabilitasi Medik"
      unitSubtitle="Sesi Fisioterapi, Terapi Okupasi, Terapi Wicara, Evaluasi Pemulihan & Latihan Mandiri"
      unitBadge="Rehabilitasi & Fisioterapi"
      themeColor={{
        bgGradient: "bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950",
        badgeBg: "bg-emerald-100 text-emerald-950 border-emerald-300",
        border: "border-emerald-200",
        text: "text-emerald-950",
      }}
      matchKeys={["rehab", "rehabilitasi", "fisioterapi", "terapi"]}
    />
  );
}
