"use client";

import React from "react";

export default function FormODC({ entryDetail, type, onUpdateDetailField }) {
	return (
		<div className="space-y-6 font-sans">
			<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
				<h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-2">
					Formulir One Day Care (ODC) / Pelayanan Observasi Singkat
				</h3>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Anamnesis & Alasan Observasi ODC</label>
					<textarea
						rows={3}
						value={entryDetail.complaint || ""}
						onChange={(e) => onUpdateDetailField(type, "complaint", e.target.value)}
						placeholder="Indikasi observasi singkat / One Day Care..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Catatan Observasi Jam ke Jam & Evaluasi Terapi</label>
					<textarea
						rows={4}
						value={entryDetail.odc_observation || ""}
						onChange={(e) => onUpdateDetailField(type, "odc_observation", e.target.value)}
						placeholder="Perkembangan kondisi selama dalam masa observasi ODC..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Kondisi & Status Pemulangan ODC</label>
					<textarea
						rows={2}
						value={entryDetail.discharge_summary || ""}
						onChange={(e) => onUpdateDetailField(type, "discharge_summary", e.target.value)}
						placeholder="Kondisi akhir saat selesai observasi (Boleh pulang / Rawat Inap lanjutan)..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>
			</div>
		</div>
	);
}
