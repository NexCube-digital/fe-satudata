'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export interface ToastProps {
  show?: boolean;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | string;
  title?: string;
  onClose?: () => void;
  duration?: number;
  toast?: {
    show?: boolean;
    message?: string;
    type?: string;
    title?: string;
  };
}

export default function Toast({
  show,
  message,
  type = 'success',
  title,
  onClose,
  duration = 4000,
  toast,
}: ToastProps) {
  const isShow = Boolean(toast ? toast.show : show);
  const msg = toast ? toast.message : message;
  const toastType = toast ? (toast.type || 'success') : type;
  const toastTitle = toast ? toast.title : title;

  useEffect(() => {
    if (!isShow) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isShow, duration, onClose]);

  if (!isShow || !msg) return null;

  const typeStyles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
      accent: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <XCircle className="h-5 w-5 text-rose-600 shrink-0" />,
      accent: 'bg-rose-500',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />,
      accent: 'bg-amber-500',
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
      accent: 'bg-sky-500',
    },
  };

  const style = typeStyles[toastType as keyof typeof typeStyles] || typeStyles.success;

  return (
    <div className="fixed top-5 right-5 z-[100] animate-in fade-in slide-in-from-top-5 duration-300 max-w-sm w-full">
      <div className={`relative flex items-start gap-3 p-4 rounded-2xl border shadow-xl ${style.bg}`}>
        <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${style.accent}`} />
        <div className="pl-1">{style.icon}</div>
        <div className="flex-1 min-w-0 pr-2">
          {toastTitle && <div className="text-xs font-bold leading-tight mb-0.5">{toastTitle}</div>}
          <div className="text-xs font-medium leading-relaxed break-words">{msg}</div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
