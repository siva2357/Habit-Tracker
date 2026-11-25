import React from 'react';
import { Calendar, ChevronDown, Search, AlertCircle } from 'lucide-react';

/**
 * Reusable Standard Text/Number/Password Input
 */
export function Input({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full rounded-xl border text-sm font-medium transition-all duration-200 outline-none
            bg-white text-slate-900 placeholder:text-slate-400
            shadow-xs
            ${Icon ? 'pl-10 pr-4' : 'px-4'} py-2.5
            ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-slate-500 font-normal">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Reusable Date Input
 */
export function DateInput({
  label,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  min,
  max,
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400">
          <Calendar className="w-4 h-4" />
        </div>

        <input
          id={inputId}
          name={name}
          type="date"
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          className={`
            w-full rounded-xl border text-sm font-medium transition-all duration-200 outline-none
            bg-white text-slate-900 pl-10 pr-4 py-2.5 shadow-xs
            ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-slate-500 font-normal">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Reusable Dropdown / Select Input
 */
export function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full appearance-none rounded-xl border text-sm font-medium transition-all duration-200 outline-none
            bg-white text-slate-900 px-4 py-2.5 pr-10 shadow-xs cursor-pointer
            ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt, idx) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={idx} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3.5 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && (
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-slate-500 font-normal">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Reusable TextArea Input
 */
export function Textarea({
  label,
  placeholder = '',
  value,
  onChange,
  rows = 4,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <textarea
        id={inputId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full rounded-xl border text-sm font-medium transition-all duration-200 outline-none
          bg-white text-slate-900 px-4 py-2.5 shadow-xs resize-y
          ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
              : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-slate-500 font-normal">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Reusable Checkbox
 */
export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  id,
  name
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label htmlFor={inputId} className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <input
        id={inputId}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
      />
      {label && <span className="text-sm font-semibold text-slate-700">{label}</span>}
    </label>
  );
}

export default Input;
