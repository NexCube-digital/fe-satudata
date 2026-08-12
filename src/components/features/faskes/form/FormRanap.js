"use client";

import React from "react";

export default function FormRanap({ entryDetail, type, onUpdateDetailField, parseVitalSigns }) {
	const vs = parseVitalSigns ? parseVitalSigns(entryDetail.vital_signs) : {};

	return (
		<div className="space-y-6 font-sans">
			<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
				<h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-2">
					Formulir Rekam Medis Rawat Inap (Ranap)
				</h3>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Hasil Anamnesis & Keluhan Masuk Rawat Inap</label>
					<textarea
						rows={3}
						value={entryDetail.complaint || ""}
						onChange={(e) => onUpdateDetailField(type, "complaint", e.target.value)}
						placeholder="Keluhan utama saat pasien masuk ruang perawatan..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Riwayat Penyakit Lengkap & Alergi Obat</label>
					<textarea
						rows={3}
						value={entryDetail.anamnesis || ""}
						onChange={(e) => onUpdateDetailField(type, "anamnesis", e.target.value)}
						placeholder="Riwayat penyakit sekarang, riwayat operasi, penyakit dahulu, alergi obat..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Catatan Perkembangan Pasien Terpadu (CPPT) & Observasi</label>
					<textarea
						rows={4}
						value={entryDetail.clinical_observation || ""}
						onChange={(e) => onUpdateDetailField(type, "clinical_observation", e.target.value)}
						placeholder="CPPT harian, instruksi DPJP, evaluasi perkembangan pasien..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Ringkasan Pulang (Discharge Summary)</label>
					<textarea
						rows={3}
						value={entryDetail.discharge_summary || ""}
						onChange={(e) => onUpdateDetailField(type, "discharge_summary", e.target.value)}
						placeholder="Ringkasan kondisi saat pulang, instruksi obat pulang & jadwal kontrol..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>
			</div>
		</div>
	);
}
