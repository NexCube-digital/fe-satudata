"use client";

import UnitPageLayout from "@/components/features/faskes/units/UnitPageLayout";

export default function RawatJalanHistoryPage() {
  return (
    <UnitPageLayout
      unitKey="rawat-jalan"
      unitTitle="Pelayanan Rawat Jalan (Poliklinik)"
      unitSubtitle="Riwayat Rekam Medis & Konsultasi Poliklinik Pasien Rawat Jalan"
      unitBadge="Poliklinik & Rawat Jalan"
      themeColor={{
        bgGradient: "bg-gradient-to-r from-teal-800 via-teal-900 to-cyan-950",
        badgeBg: "bg-cyan-100 text-cyan-950 border-cyan-300",
        border: "border-cyan-200",
        text: "text-cyan-950",
      }}
      matchKeys={["rawat_jalan", "rajal", "poli", "poliklinik"]}
      defaultTab="riwayat"
    />
  );
}
