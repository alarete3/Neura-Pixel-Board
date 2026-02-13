import React, { useEffect } from 'react';
import { Check, X, AlertTriangle, ExternalLink, Info } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  txHash?: string;
  explorerUrl?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: Check,
    error: X,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: {
      bg: 'bg-[#10b981]/10',
      border: 'border-[#10b981]/30',
      icon: 'text-[#10b981]',
    },
    error: {
      bg: 'bg-[#ef4444]/10',
      border: 'border-[#ef4444]/30',
      icon: 'text-[#ef4444]',
    },
    warning: {
      bg: 'bg-[#f59e0b]/10',
      border: 'border-[#f59e0b]/30',
      icon: 'text-[#f59e0b]',
    },
    info: {
      bg: 'bg-[#38bdf8]/10',
      border: 'border-[#38bdf8]/30',
      icon: 'text-[#38bdf8]',
    },
  };

  const IconComponent = icons[toast.type];
  const colorScheme = colors[toast.type];

  return (
    <div
      className={`toast ${colorScheme.bg} border ${colorScheme.border} flex items-start gap-3`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colorScheme.bg} flex items-center justify-center`}>
        <IconComponent className={`w-4 h-4 ${colorScheme.icon}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-[#A3A3A3] mt-0.5">{toast.message}</p>
        )}
        {toast.txHash && toast.explorerUrl && (
          <a
            href={toast.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm text-[#9E7FFF] hover:text-[#38bdf8] transition-colors"
          >
            View Transaction
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-[#A3A3A3]" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
