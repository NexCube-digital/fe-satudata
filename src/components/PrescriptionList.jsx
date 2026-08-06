"use client";

import { Pill } from "lucide-react";

function parsePrescriptionList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (err) {
      // Fallback untuk string teks resep biasa (misal: "Amoxicillin 500mg (15 Kaplet), Paracetamol 500mg (10 Tablet)")
      return raw.split(",").map((medStr) => {
        const trimmed = medStr.trim();
        const match = trimmed.match(/^(.*?)(?:\s*\((.*?)\))?$/);
        return {
          medicine: match && match[1] ? match[1].trim() : trimmed,
          quantity: match && match[2] ? match[2].trim() : "-",
          rule: "Diminum 3x1 sesudah makan"
        };
      });
    }
  }
  return [];
}

/**
 * Menampilkan list_of_medicines (string JSON) dengan rapi, bukan mentah.
 *
 * Contoh pakai di modal/halaman detail rekam medis:
 *   <PrescriptionList rawListOfMedicines={record.detail?.resep?.list_of_medicines} />
 */
export default function PrescriptionList({ rawListOfMedicines }) {
  const items = parsePrescriptionList(rawListOfMedicines);

  if (items.length === 0) {
    return <p className="text-xs text-slate-400 italic">Tidak ada data obat pada rekam medis ini.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li
          key={`${item.medicine_id || item.medicine || "obat"}-${idx}`}
          className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <Pill className="h-3.5 w-3.5 text-rose-700 shrink-0" />
              {item.medicine || "Obat tanpa nama"}
            </span>
            <span className="shrink-0 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-0.5 whitespace-nowrap">
              {item.quantity || "-"}
            </span>
          </div>
          {item.rule && (
            <p className="mt-1.5 text-xs text-slate-500">
              Aturan pakai: <span className="font-medium text-slate-600">{item.rule}</span>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}