import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Toast Item Component
 * Variants: 'success' | 'error' | 'info' | 'warning'
 */
export function ToastItem({ toast, onDismiss }) {
  const { id, type = 'info', title, message } = toast;

  const variantConfigs = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200',
      leftBorder: 'border-l-emerald-500',
      titleColor: 'text-emerald-950',
      badgeText: 'bg-emerald-100 text-emerald-800'
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 border-rose-200',
      leftBorder: 'border-l-rose-500',
      titleColor: 'text-rose-950',
      badgeText: 'bg-rose-100 text-rose-800'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200',
      leftBorder: 'border-l-amber-500',
      titleColor: 'text-amber-950',
      badgeText: 'bg-amber-100 text-amber-800'
    },
    info: {
      icon: Info,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-200',
      leftBorder: 'border-l-indigo-500',
      titleColor: 'text-indigo-950',
      badgeText: 'bg-indigo-100 text-indigo-800'
    }
  };

  const config = variantConfigs[type] || variantConfigs.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.92 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-auto w-full max-w-sm rounded-2xl p-4 shadow-2xl flex items-start gap-3 bg-white border border-slate-200/90 border-l-[5px] ${config.leftBorder}`}
      style={{
        boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.18), 0 4px 12px -2px rgba(15, 23, 42, 0.08)'
      }}
    >
      {/* Icon with colored badge ring */}
      <div className={`p-2 rounded-xl border shrink-0 ${config.iconBg}`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config.iconColor}`} />
      </div>

      {/* Title & Message Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {title && (
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-xs font-black uppercase tracking-wider ${config.titleColor}`}>
              {title}
            </h4>
          </div>
        )}
        <p className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug break-words">
          {message}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss(id)}
        className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

/**
 * Toast Container / Toaster
 * Anchored at z-[9999] top-right so it never gets obscured
 */
export default function Toaster({ toasts = [], onDismiss }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
