"use client";

import UnitPageLayout from "@/components/features/faskes/units/UnitPageLayout";

export default function IgdUnitPage() {
  return (
    <UnitPageLayout
      unitKey="igd"
      unitTitle="Instalasi Gawat Darurat (IGD)"
      unitSubtitle="Layanan Pertolongan Pertama, Triase Cito Gadar & Rekam Medis Darurat Real-Time"
      unitBadge="Gawat Darurat & Triase"
      themeColor={{
        bgGradient: "bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950",
        badgeBg: "bg-amber-100 text-amber-950 border-amber-300",
        border: "border-amber-200",
        text: "text-amber-950",
      }}
      matchKeys={["igd", "gawat_darurat", "gadar", "triase"]}
    />
  );
}
