import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Liquid Glass Button with multiple variants and sizes
 * Variants: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline'
 * Sizes: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  // Size variants
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3 rounded-xl gap-1.5',
    md: 'text-sm py-2.5 px-4 rounded-xl gap-2',
    lg: 'text-base py-3.5 px-6 rounded-2xl gap-2.5 font-bold'
  };

  // Visual variants with complete light theme liquid glass aesthetics
  const variantStyles = {
    primary: {
      className: 'text-white border border-white/30 shadow-lg shadow-indigo-500/35 hover:shadow-indigo-500/45',
      style: {
        background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
        color: '#ffffff'
      }
    },
    secondary: {
      className: 'bg-white/80 hover:bg-white text-slate-800 border border-slate-200/80 hover:border-slate-300 shadow-sm shadow-slate-900/5',
      style: {
        backdropFilter: 'blur(12px)'
      }
    },
    danger: {
      className: 'text-white border border-rose-400/30 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/45',
      style: {
        background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
        color: '#ffffff'
      }
    },
    success: {
      className: 'text-white border border-emerald-400/30 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/45',
      style: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff'
      }
    },
    ghost: {
      className: 'bg-transparent hover:bg-white/60 text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200/60 shadow-none',
      style: {}
    },
    outline: {
      className: 'bg-white/40 hover:bg-white/80 text-indigo-700 border border-indigo-200 hover:border-indigo-400 shadow-xs',
      style: {
        backdropFilter: 'blur(8px)'
      }
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98, y: 0 } : {}}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={currentVariant.style}
      className={`
        inline-flex items-center justify-center font-bold tracking-tight select-none cursor-pointer
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${sizeClasses[size] || sizeClasses.md}
        ${currentVariant.className}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </motion.button>
  );
}
