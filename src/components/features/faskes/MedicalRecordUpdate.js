"use client";

import { RefreshCw, Save, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function MedicalRecordUpdateActions({
  isFirstStep,
  isSavingStep,
  isUploading,
  isLastContentStep,
  recordId,
  isFinalRecord,
  canSaveDraft,
  saveDraftHint,
  nextButtonLabel,
  onPrev,
  onNext,
  onSaveDraft,
  onFinalSubmit,
}) {
  const saveDraftDisabled = isSavingStep || isUploading || !canSaveDraft;

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep || isSavingStep || isUploading}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" /> Sebelumnya
      </button>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saveDraftDisabled}
          title={saveDraftDisabled && saveDraftHint ? saveDraftHint : undefined}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSavingStep ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Draft, Lanjutkan Nanti
        </button>

        {isLastContentStep ? (
          <button
            type="button"
            onClick={onFinalSubmit}
            disabled={isUploading || !recordId}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 px-5 py-3 text-sm font-bold text-white hover:from-teal-800 hover:to-cyan-900 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isFinalRecord ? "Simpan Koreksi & Anchor Ulang" : "Unggah & Finalisasi ke Blockchain"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isSavingStep}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 px-5 py-3 text-sm font-bold text-white hover:from-teal-800 hover:to-cyan-900 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isSavingStep ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            {nextButtonLabel || "Lanjutkan"} <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
