"use client";

import UnitPageLayout from "@/components/features/faskes/units/UnitPageLayout";

export default function BedahHistoryPage() {
  return (
    <UnitPageLayout
      unitKey="bedah"
      unitTitle="Kamar Operasi & Bedah (OKA)"
      unitSubtitle="Riwayat Laporan Operasi Bedah, Catatan Anestesi & Instuksi Pasca Operasi"
      unitBadge="Kamar Operasi / Bedah OKA"
      themeColor={{
        bgGradient: "bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950",
        badgeBg: "bg-teal-100 text-teal-950 border-teal-300",
        border: "border-teal-200",
        text: "text-teal-950",
      }}
      matchKeys={["bedah", "bedah_sentral", "oka", "operasi"]}
      defaultTab="riwayat"
    />
  );
}
