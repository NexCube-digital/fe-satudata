"use client";

import React from "react";

export default function FormBedah({ entryDetail, type, onUpdateDetailField }) {
	return (
		<div className="space-y-6 font-sans">
			<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
				<h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-2">
					Formulir Laporan Operasi & Bedah
				</h3>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis Pre-Operasi & Indikasi Bedah</label>
					<textarea
						rows={2}
						value={entryDetail.pre_op_diagnosis || ""}
						onChange={(e) => onUpdateDetailField(type, "pre_op_diagnosis", e.target.value)}
						placeholder="Diagnosis sebelum tindakan bedah / operasi dilakukan..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Laporan Prosedur & Tindakan Operasi</label>
					<textarea
						rows={4}
						value={entryDetail.op_report || ""}
						onChange={(e) => onUpdateDetailField(type, "op_report", e.target.value)}
						placeholder="Uraian jalannya operasi, pembiusan/anestesi, temuan intra-operatif, serta komplikasi..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>

				<div>
					<label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis Post-Operasi & Instruksi Pasca Bedah</label>
					<textarea
						rows={3}
						value={entryDetail.post_op_instructions || ""}
						onChange={(e) => onUpdateDetailField(type, "post_op_instructions", e.target.value)}
						placeholder="Diagnosis pasca operasi, instruksi ruang pemulihan (PACU) & obat pasca bedah..."
						className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
					/>
				</div>
			</div>
		</div>
	);
}
