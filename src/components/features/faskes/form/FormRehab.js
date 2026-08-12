"use client";

import React from "react";

export default function FormRehab({ entryDetail, type, onUpdateDetailField }) {
	return (
		<div className="space-y-6 font-sans">
			<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
				<h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-2">
					Formulir Rehabilitasi Medik / Fisioterapi
				</h3>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Evaluasi Fungsi & Asesmen Keterbatasan fisik</label>
					<textarea
						rows={3}
						value={entryDetail.functional_assessment || ""}
						onChange={(e) => onUpdateDetailField(type, "functional_assessment", e.target.value)}
						placeholder="Hasil pengkajian modalitas fisioterapi, ROM, kekuatan otot, dan fungsional..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Program & Modalitas Terapi Diberikan</label>
					<textarea
						rows={3}
						value={entryDetail.therapy_program || ""}
						onChange={(e) => onUpdateDetailField(type, "therapy_program", e.target.value)}
						placeholder="Program fisioterapi / okupasi terapi / terapi wicara yang dilakukan..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Evaluasi Hasil Terapi & Rencana Sesi Selanjutnya</label>
					<textarea
						rows={2}
						value={entryDetail.therapy_evaluation || ""}
						onChange={(e) => onUpdateDetailField(type, "therapy_evaluation", e.target.value)}
						placeholder="Respon setelah terapi & jumlah sesi lanjutan yang dijadwalkan..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>
			</div>
		</div>
	);
}
