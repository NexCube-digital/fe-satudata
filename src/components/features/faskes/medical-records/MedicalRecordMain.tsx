'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  RefreshCw,
  Check,
  X,
  Paperclip,
  Info,
  ChevronDown,
  Search,
  Pill,
  AlertTriangle,
  Stethoscope,
  Activity,
  Sparkles,
  Clock,
  CreditCard,
  User,
  Phone,
  PenTool,
  FileText,
  Send,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  ChevronRight,
  Hospital,
  UserPlus,
  Copy,
  ArrowRightLeft,
  Building2,
} from 'lucide-react';
import {
  FormIGD,
  FormRanap,
  FormRajal,
  FormBedah,
  FormODC,
  FormRehab,
  FormRujuk,
  DeathCertificate,
} from '@/components/features/faskes/medical-records/forms';
import MedicalRecordUpdateActions from '@/components/features/faskes/MedicalRecordUpdate';
import { searchICD10, searchICD9 } from '@/data/icdData';
import DigitalSignatureCanvas from '@/components/shared/digital-signature-canvas';
import NewPatientModal from '@/components/features/faskes/NewPatientModal';

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = '-- Pilih --',
  isLoading = false,
  loadingText = 'Memuat...',
  emptyText = 'Tidak ada hasil yang cocok.',
  disabled = false,
  required = false,
}: any) {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const normalize = (v: any) => String(v ?? '');
  const selected = options.find((o: any) => normalize(o.value) === normalize(value));

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o: any) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const toggleOpen = () => {
    if (disabled || isLoading) return;
    setOpen((o) => !o);
  };

  return (
    <div className="relative" ref={containerRef}>
      {required && (
        <input tabIndex={-1} value={value || ''} onChange={() => {}} required className="sr-only" aria-hidden="true" />
      )}

      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled || isLoading}
        className="w-full flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-hidden disabled:opacity-60 cursor-pointer"
      >
        <span className={`truncate text-left ${selected ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {isLoading ? loadingText : selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !isLoading && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setOpen(false);
                    setQuery('');
                  }
                }}
                placeholder="Cari..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-hidden"
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {value && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  -- Kosongkan pilihan --
                </button>
              </li>
            )}

            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">{emptyText}</li>
            ) : (
              filteredOptions.map((opt: any) => {
                const isSelected = normalize(opt.value) === normalize(value);
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => {
                        if (opt.disabled) return;
                        onChange(opt.value);
                        setOpen(false);
                        setQuery('');
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition ${
                        opt.disabled
                          ? 'text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-teal-50 text-teal-800 font-semibold cursor-pointer'
                          : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ComboboxInput({ value, onChange, options, placeholder = 'Ketik atau pilih dari daftar...' }: any) {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    if (!q) return options;
    return options.filter((o: string) => o.toLowerCase().includes(q));
  }, [options, value]);

  const isCustomValue =
    value && value.trim() !== '' && !options.some((o: string) => o.toLowerCase() === value.trim().toLowerCase());

  return (
    <div className="relative" ref={containerRef}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        type="text"
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-hidden"
      />

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <ul className="max-h-52 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">Tidak ada preset yang cocok, teks kamu tetap dipakai.</li>
            ) : (
              filteredOptions.map((opt: string) => (
                <li key={opt}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition cursor-pointer ${
                      opt.toLowerCase() === (value || '').trim().toLowerCase()
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                </li>
              ))
            )}
          </ul>
          {isCustomValue && (
            <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
              Tidak ada di daftar preset -- teks kustom kamu akan tetap dipakai:{' '}
              <span className="font-semibold text-slate-600">&ldquo;{value}&rdquo;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ICD10Autocomplete({ value, onChange, placeholder = 'Cari Kode / Nama Diagnosa ICD-10...' }: any) {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => searchICD10(query), [query]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-hidden font-medium"
        />
        <Search className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <ul className="max-h-60 overflow-y-auto py-1">
            {searchResults.length === 0 ? (
              <li className="px-4 py-3 text-xs text-slate-400">
                Tidak ada hasil ICD-10 yang cocok. Ketik manual jika tidak terdaftar.
              </li>
            ) : (
              searchResults.map((item: any) => (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(`${item.code} - ${item.name}`);
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50"
                  >
                    <div>
                      <span className="font-mono font-extrabold text-xs text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md mr-2">
                        {item.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">{item.category}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ICD10MultiSelect({ value, onChange }: any) {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedList = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }, [value]);

  const updateSelected = (newList: any[]) => {
    onChange(JSON.stringify(newList));
  };

  const addCode = (codeStr: string) => {
    if (!selectedList.includes(codeStr)) {
      updateSelected([...selectedList, codeStr]);
    }
    setQuery('');
    setOpen(false);
  };

  const removeCode = (codeStr: string) => {
    updateSelected(selectedList.filter((c: string) => c !== codeStr));
  };

  const searchResults = useMemo(() => searchICD10(query), [query]);

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selectedList.map((codeStr: string, idx: number) => (
          <span
            key={`${codeStr}-${idx}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 px-3 py-1 rounded-xl"
          >
            <span>{codeStr}</span>
            <button
              type="button"
              onClick={() => removeCode(codeStr)}
              className="text-teal-500 hover:text-red-600 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {selectedList.length === 0 && (
          <span className="text-xs italic text-slate-400">Belum ada diagnosis sekunder dipilih.</span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Cari & tambah Diagnosis Sekunder (ICD-10)..."
          className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-hidden font-medium"
        />
        <Search className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

        {open && query.trim() && (
          <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <ul className="max-h-52 overflow-y-auto py-1">
              {searchResults.length === 0 ? (
                <li className="px-4 py-2.5 text-xs text-slate-400">Tidak ada ICD-10 yang cocok.</li>
              ) : (
                searchResults.map((item: any) => {
                  const labelStr = `${item.code} - ${item.name}`;
                  const isPicked = selectedList.includes(labelStr);
                  return (
                    <li key={item.code}>
                      <button
                        type="button"
                        onClick={() => addCode(labelStr)}
                        disabled={isPicked}
                        className={`w-full text-left px-4 py-2 hover:bg-teal-50 transition cursor-pointer flex items-center justify-between text-xs ${
                          isPicked ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''
                        }`}
                      >
                        <div>
                          <span className="font-mono font-bold text-teal-800 mr-2">{item.code}</span>
                          <span className="text-slate-800">{item.name}</span>
                        </div>
                        {isPicked && <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function ICD9MultiSelect({ value, onChange }: any) {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedList = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }, [value]);

  const updateSelected = (newList: any[]) => {
    onChange(newList);
  };

  const addCode = (codeStr: string) => {
    if (!selectedList.includes(codeStr)) {
      updateSelected([...selectedList, codeStr]);
    }
    setQuery('');
    setOpen(false);
  };

  const removeCode = (codeStr: string) => {
    updateSelected(selectedList.filter((c: string) => c !== codeStr));
  };

  const searchResults = useMemo(() => searchICD9(query), [query]);

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selectedList.map((codeStr: string, idx: number) => (
          <span
            key={`${codeStr}-${idx}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1 rounded-xl"
          >
            <span>{codeStr}</span>
            <button
              type="button"
              onClick={() => removeCode(codeStr)}
              className="text-indigo-500 hover:text-red-600 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {selectedList.length === 0 && (
          <span className="text-xs italic text-slate-400">Belum ada tindakan ICD-9-CM dipilih.</span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Cari & pilih Tindakan Medis (ICD-9-CM)..."
          className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden font-medium"
        />
        <Search className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

        {open && query.trim() && (
          <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <ul className="max-h-52 overflow-y-auto py-1">
              {searchResults.length === 0 ? (
                <li className="px-4 py-2.5 text-xs text-slate-400">Tidak ada prosedur ICD-9-CM yang cocok.</li>
              ) : (
                searchResults.map((item: any) => {
                  const labelStr = `${item.code} - ${item.name}`;
                  const isPicked = selectedList.includes(labelStr);
                  return (
                    <li key={item.code}>
                      <button
                        type="button"
                        onClick={() => addCode(labelStr)}
                        disabled={isPicked}
                        className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition cursor-pointer flex items-center justify-between text-xs ${
                          isPicked ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''
                        }`}
                      >
                        <div>
                          <span className="font-mono font-bold text-indigo-800 mr-2">{item.code}</span>
                          <span className="text-slate-800">{item.name}</span>
                        </div>
                        {isPicked && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function CopyResepPreview({ prescriptionItems, patientName = '', doctorName = '', visitDate = '' }: any) {
  if (!prescriptionItems || prescriptionItems.length === 0) return null;

  const validItems = prescriptionItems.filter((i: any) => i.medicine || i.medicineId);
  if (validItems.length === 0) return null;

  return (
    <div className="mt-6 rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50/80 via-amber-50/30 to-yellow-50/60 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-amber-200 pb-3">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-amber-700" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-950">AUTO-GENERATED COPY RESEP (E-PRESCRIBING)</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
          Salinan Resep Resmi
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-2xs font-mono text-xs text-slate-800 space-y-3">
        <div className="text-center border-b border-dashed border-slate-300 pb-3">
          <h4 className="font-sans font-black text-sm uppercase tracking-wide text-slate-900">SATUDATA HEALTH SERVICES</h4>
          <p className="font-sans text-[11px] text-slate-500 font-semibold">INSTALASI FARMASI & APOTEK PELAYANAN MEDIS</p>
          <div className="inline-block mt-1 font-sans font-extrabold text-[11px] bg-slate-100 text-slate-700 px-3 py-0.5 rounded-md uppercase">
            COPY RESEP (SALINAN RESEP)
          </div>
        </div>

        <div className="grid grid-cols-2 text-[11px] font-sans text-slate-600 gap-1 border-b border-dashed border-slate-300 pb-2">
          <div>Pasien: <span className="font-bold text-slate-900">{patientName || '-'}</span></div>
          <div>Tanggal: <span className="font-bold text-slate-900">{visitDate || '-'}</span></div>
          <div>Dokter DPJP: <span className="font-bold text-slate-900">{doctorName || '-'}</span></div>
          <div>Status: <span className="font-bold text-emerald-700">Elektronik Terverifikasi</span></div>
        </div>

        <div className="space-y-2 py-1">
          {validItems.map((item: any, idx: number) => (
            <div key={item.id || idx} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>R/ {item.medicine || 'Obat'}</span>
                <span>No. {item.quantity || '1'} {item.unit || 'Pcs'}</span>
              </div>
              <div className="pl-6 text-slate-600 text-[11px] italic">
                S. {item.rule || '3x1 sesudah makan'}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-slate-300 pt-3 flex items-center justify-between font-sans text-[10px] text-slate-500">
          <span>* Salinan resep ini dibuat otomatis oleh sistem E-Prescribing SatuData.</span>
          <span className="font-bold text-slate-700">PCC (Pro Copie Conform)</span>
        </div>
      </div>
    </div>
  );
}

export default function MedicalRecordMain(props: any) {
  const {
    isResuming,
    isEditRoute,
    loadError,
    onBackToList,
    resumedFromDraft,
    onResetWizard,
    isFinalRecord,
    steps,
    currentStepIndex,
    onGoToStep,
    isSavingStep,
    isUploading,
    currentStep,
    stepJenis,
    stepKunjungan,
    stepLampiran,
    recordTypes,
    penunjangMainCategories,
    selectedPenunjangCategories,
    onTogglePenunjangCategory,
    penunjangSubItems,
    selectedPenunjangSubItems,
    onTogglePenunjangSubItem,
    roomOptions,
    layananAdminOptions,
    subLayananItems,
    selectedTypes,
    onToggleRecordType,
    patientId,
    onPatientChange,
    patientOptions,
    loadingPatients,
    recordId,
    approvedPatients,
    title,
    onTitleChange,
    visitId,
    onVisitIdChange,
    primaryEntryPoint,
    onPrimaryEntryPointChange,
    igdDischargeDecision,
    onIgdDischargeDecisionChange,
    rujukanData,
    onRujukanDataChange,
    deathData,
    onDeathDataChange,
    cpptNotes,
    onCpptNotesChange,
    onPatientCreated,
    visitDate,
    onVisitDateChange,
    visitTime,
    onVisitTimeChange,
    paymentType,
    onPaymentTypeChange,
    escortName,
    onEscortNameChange,
    escortRelation,
    onEscortRelationChange,
    escortPhone,
    onEscortPhoneChange,
    nakesName,
    onNakesNameChange,
    doctorSignature,
    onDoctorSignatureChange,
    icd9Procedures,
    onIcd9ProceduresChange,
    nursingCareNotes,
    onNursingCareNotesChange,
    penunjangResultText,
    onPenunjangResultTextChange,
    todayStr,
    typeOfTreatment,
    onTypeOfTreatmentChange,
    typeOfTreatmentOptions,
    doctorSpecialtyFilter,
    onDoctorSpecialtyFilterChange,
    specialtiesList,
    doctorId,
    onDoctorChange,
    doctorOptions,
    loadingDoctors,
    selectedDoctorInfo,
    doctorsForSelection,
    summary,
    onSummaryChange,
    getDetailFieldsConfig,
    detailsByType,
    buildEmptyDetail,
    onUpdateDetailField,
    prescriptionItems,
    getRowStockError,
    getRemainingStockForRow,
    onRemovePrescriptionRow,
    loadingMedicines,
    onSelectMedicineForRow,
    onQuantityChange,
    onUpdatePrescriptionRow,
    dosageRulePresets,
    onAddPrescriptionRow,
    maxAttachments,
    onHandleFilesSelected,
    existingAttachmentsInfo,
    attachmentFiles,
    onRemoveAttachment,
    updateActionsProps,
  } = props;

  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState<boolean>(false);

  const parseVitalSigns = (jsonVal: any) => {
    if (!jsonVal) return {};
    if (typeof jsonVal === 'object') return jsonVal;
    try {
      return JSON.parse(jsonVal);
    } catch {
      return {};
    }
  };

  const selectedPatientInfo = useMemo(
    () => approvedPatients.find((p: any) => String(p.patientId) === String(patientId)) || null,
    [approvedPatients, patientId]
  );

  const getStepLabel = (stepKey: string) => {
    if (stepKey === stepKunjungan) return 'Ringkasan & Registrasi Kunjungan Pasien';
    if (stepKey === stepLampiran) return 'Resep Obat & Lampiran Medis';
    if (stepKey.startsWith('detail_')) {
      const type = stepKey.replace('detail_', '');
      const rec = recordTypes.find((r: any) => r.value === type);
      return rec ? rec.label : type;
    }
    return stepKey;
  };

  if (isResuming) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
        <RefreshCw className="h-8 w-8 text-teal-800 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-800">Memuat Data Rekam Medis...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Gagal Memuat Rekam Medis</h3>
        <p className="text-xs text-rose-700 max-w-md mx-auto">{loadError}</p>
        <button
          onClick={onBackToList}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
        >
          Kembali ke Daftar Rekam Medis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {resumedFromDraft && (
        <div className="bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-teal-500/5 border border-teal-300 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Draft Otomatis Berhasil Dimuat</p>
              <p className="text-[11px] text-slate-500">Anda dapat melanjutkan pengisian data rekam medis ini.</p>
            </div>
          </div>
          <button
            onClick={onResetWizard}
            className="text-xs font-extrabold text-teal-800 hover:text-teal-900 underline cursor-pointer"
          >
            Mulai Baru
          </button>
        </div>
      )}

      {/* Stepper Navigation Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {steps.map((stepKey: string, idx: number) => {
            const isActive = idx === currentStepIndex;
            const isDone = idx < currentStepIndex;
            return (
              <button
                key={stepKey}
                onClick={() => onGoToStep(idx)}
                disabled={isSavingStep || isUploading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap border shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-700 to-cyan-800 text-white border-teal-700 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-white text-teal-800'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                </span>
                <span>{getStepLabel(stepKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* STEP KUNJUNGAN */}
        {currentStep === stepKunjungan && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Hospital className="h-5 w-5 text-teal-800" />
                  Registrasi & Informasi Kunjungan Pasien
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Pilih pasien terdaftar & detail registrasi kunjungan</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPatientModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                + Tambah Pasien Baru
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Pilih Pasien Terdaftar *
                </label>
                <SearchableSelect
                  value={patientId}
                  onChange={onPatientChange}
                  options={patientOptions}
                  isLoading={loadingPatients}
                  placeholder="-- Pilih Pasien --"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Judul / Keluhan Utama Rekam Medis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemeriksaan Rawat Jalan Poli Penyakit Dalam"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 font-medium"
                />
              </div>
            </div>

            {selectedPatientInfo && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">No. RM</span>
                  <span className="font-extrabold text-slate-900 font-mono">{selectedPatientInfo.mr_number}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">NIK</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedPatientInfo.nik}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Jenis Kelamin / Usia</span>
                  <span className="font-bold text-slate-800">{selectedPatientInfo.sex} ({selectedPatientInfo.age})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Gol. Darah</span>
                  <span className="font-extrabold text-rose-700">{selectedPatientInfo.blood_type || '-'}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Unit Entri Utama (Primary Entry Point) *
                </label>
                <select
                  value={primaryEntryPoint}
                  onChange={(e) => onPrimaryEntryPointChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 font-medium cursor-pointer"
                >
                  <option value="">-- Pilih Unit Entri --</option>
                  <option value="igd">IGD (Instalasi Gawat Darurat)</option>
                  <option value="rawat_jalan">Rawat Jalan (Poli Spesialis)</option>
                  <option value="rawat_inap">Direct Rawat Inap</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tanggal Kunjungan *
                </label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => onVisitDateChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Jenis Pembayaran *
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => onPaymentTypeChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 font-medium cursor-pointer"
                >
                  <option value="">-- Pilih Jaminan --</option>
                  <option value="BPJS Kesehatan">BPJS Kesehatan</option>
                  <option value="Umum / Mandiri">Umum / Mandiri</option>
                  <option value="Asuransi Swasta">Asuransi Swasta</option>
                  <option value="Jaminan Perusahaan">Jaminan Perusahaan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Dokter Penanggung Jawab (DPJP)
                </label>
                <SearchableSelect
                  value={doctorId}
                  onChange={onDoctorChange}
                  options={doctorOptions}
                  isLoading={loadingDoctors}
                  placeholder="-- Pilih Dokter --"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Catatan Ringkas / Resume Medis
                </label>
                <input
                  type="text"
                  placeholder="Catatan ringkas dari dokter..."
                  value={summary}
                  onChange={(e) => onSummaryChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP FORM SPECIFIC BY TYPE */}
        {currentStep.startsWith('detail_') && (
          <div className="space-y-6">
            {(() => {
              const currentType = currentStep.replace('detail_', '');
              const entryDetail = detailsByType[currentType] || {};

              if (currentType === 'igd') {
                return (
                  <FormIGD
                    field={{ name: 'igd_triase_data', label: 'Triage & Form IGD' }}
                    entryDetail={entryDetail}
                    type={currentType}
                    parseVitalSigns={parseVitalSigns}
                    onUpdateDetailField={onUpdateDetailField}
                    onNavigateToRanap={() => {
                      onToggleRecordType('rawat_inap');
                    }}
                    onEnsureRanapStep={() => {
                      if (!selectedTypes.includes('rawat_inap')) onToggleRecordType('rawat_inap');
                    }}
                  />
                );
              }

              if (currentType === 'rawat_inap') {
                return (
                  <FormRanap
                    entryDetail={entryDetail}
                    type={currentType}
                    parseVitalSigns={parseVitalSigns}
                    onUpdateDetailField={onUpdateDetailField}
                    roomOptions={roomOptions}
                  />
                );
              }

              if (currentType === 'rawat_jalan') {
                return (
                  <FormRajal
                    entryDetail={entryDetail}
                    type={currentType}
                    parseVitalSigns={parseVitalSigns}
                    onUpdateDetailField={onUpdateDetailField}
                  />
                );
              }

              if (currentType === 'bedah_sentral') {
                return (
                  <FormBedah
                    entryDetail={entryDetail}
                    type={currentType}
                    parseVitalSigns={parseVitalSigns}
                    onUpdateDetailField={onUpdateDetailField}
                  />
                );
              }

              if (currentType === 'one_day_care') {
                return (
                  <FormODC
                    entryDetail={entryDetail}
                    type={currentType}
                    parseVitalSigns={parseVitalSigns}
                    onUpdateDetailField={onUpdateDetailField}
                  />
                );
              }

              if (currentType === 'rehab_medik') {
                return (
                  <FormRehab
                    entryDetail={entryDetail}
                    type={currentType}
                    parseVitalSigns={parseVitalSigns}
                    onUpdateDetailField={onUpdateDetailField}
                  />
                );
              }

              if (currentType === 'rujukan_medis') {
                return (
                  <FormRujuk
                    entryDetail={entryDetail}
                    type={currentType}
                    onUpdateDetailField={onUpdateDetailField}
                  />
                );
              }

              if (currentType === 'death_certificate') {
                return (
                  <DeathCertificate
                    entryDetail={entryDetail}
                    type={currentType}
                    onUpdateDetailField={onUpdateDetailField}
                  />
                );
              }

              // Generic Dynamic Form Fields
              const fields = getDetailFieldsConfig(currentType);
              return (
                <div className="space-y-4">
                  {fields.map((f: any) => (
                    <div key={f.name}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        {f.label}
                      </label>
                      {f.inputType === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={entryDetail[f.name] || ''}
                          onChange={(e) => onUpdateDetailField(currentType, f.name, e.target.value)}
                          placeholder={f.placeholder || ''}
                          className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-teal-600 font-medium"
                        />
                      ) : f.inputType === 'icd10_autocomplete' ? (
                        <ICD10Autocomplete
                          value={entryDetail[f.name] || ''}
                          onChange={(val: string) => onUpdateDetailField(currentType, f.name, val)}
                        />
                      ) : f.inputType === 'icd10_multiselect' ? (
                        <ICD10MultiSelect
                          value={entryDetail[f.name] || ''}
                          onChange={(val: string) => onUpdateDetailField(currentType, f.name, val)}
                        />
                      ) : (
                        <input
                          type="text"
                          value={entryDetail[f.name] || ''}
                          onChange={(e) => onUpdateDetailField(currentType, f.name, e.target.value)}
                          placeholder={f.placeholder || ''}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-teal-600 font-medium"
                        />
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* STEP LAMPIRAN & RESEP */}
        {currentStep === stepLampiran && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Pill className="h-5 w-5 text-teal-800" />
                Resep Obat (E-Prescribing) & Lampiran Medis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Input daftar resep obat dan lampirkan dokumen penunjang</p>
            </div>

            {/* Prescription Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Daftar Resep Obat</span>
                <button
                  type="button"
                  onClick={onAddPrescriptionRow}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> + Obat
                </button>
              </div>

              {prescriptionItems.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400">
                  Belum ada resep obat ditambahkan. Klik "+ Obat" untuk menambahkan.
                </div>
              ) : (
                <div className="space-y-2">
                  {prescriptionItems.map((item: any) => {
                    const rowError = getRowStockError(item);
                    return (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <div className="sm:col-span-2">
                            <SearchableSelect
                              value={item.medicineId}
                              onChange={(medId: string) => onSelectMedicineForRow(item.id, medId)}
                              options={loadingMedicines ? [] : getRemainingStockForRow ? getRemainingStockForRow(item.id, item.medicineId) : []}
                              placeholder="-- Pilih Obat --"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Jumlah"
                              value={item.quantity}
                              onChange={(e) => onQuantityChange(item.id, item.medicineId, e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Aturan pakai (cth: 3x1 sesudah makan)"
                              value={item.rule}
                              onChange={(e) => onUpdatePrescriptionRow(item.id, 'rule', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() => onRemovePrescriptionRow(item.id)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {rowError && <p className="text-[10px] font-bold text-rose-600">{rowError}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <CopyResepPreview
              prescriptionItems={prescriptionItems}
              patientName={selectedPatientInfo?.name}
              doctorName={selectedDoctorInfo?.name}
              visitDate={visitDate}
            />

            {/* Attachments Section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Lampiran Berkas Medis (Maks. {maxAttachments})
              </span>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition">
                <input
                  type="file"
                  multiple
                  onChange={(e) => onHandleFilesSelected(e.target.files)}
                  className="hidden"
                  id="attachment-upload-input"
                />
                <label htmlFor="attachment-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
                  <Paperclip className="h-8 w-8 text-teal-800" />
                  <span className="text-xs font-bold text-slate-700">Pilih Berkas atau Drag & Drop</span>
                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG (Maks 10MB per file)</span>
                </label>
              </div>

              {attachmentFiles.length > 0 && (
                <div className="space-y-1.5">
                  {attachmentFiles.map((file: File, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-800 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveAttachment(idx)}
                        className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Update Actions Bottom Bar */}
        <MedicalRecordUpdateActions {...updateActionsProps} />
      </div>

      {isNewPatientModalOpen && (
        <NewPatientModal
          isOpen={isNewPatientModalOpen}
          onClose={() => setIsNewPatientModalOpen(false)}
          onSuccess={(newPatient: any) => {
            onPatientCreated(newPatient);
            setIsNewPatientModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
