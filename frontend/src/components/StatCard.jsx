import React from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

const VARIANTS = {
  indigo: {
    cardBg: 'bg-gradient-to-br from-indigo-50/70 via-white to-slate-50/50 border-indigo-100',
    glow: 'bg-indigo-500/5',
    titleColor: 'text-indigo-900',
    valueColor: 'text-slate-900',
    badge: 'bg-indigo-100/70 text-indigo-800 border-indigo-200',
    border: 'border-indigo-100/60',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-100'
  },
  emerald: {
    cardBg: 'bg-gradient-to-br from-emerald-50/70 via-white to-slate-50/50 border-emerald-100',
    glow: 'bg-emerald-500/5',
    titleColor: 'text-emerald-900',
    valueColor: 'text-emerald-700',
    badge: 'bg-emerald-100/70 text-emerald-800 border-emerald-200',
    border: 'border-emerald-100/60',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-100'
  },
  rose: {
    cardBg: 'bg-gradient-to-br from-rose-50/70 via-white to-slate-50/50 border-rose-100',
    glow: 'bg-rose-500/5',
    titleColor: 'text-rose-900',
    valueColor: 'text-rose-700',
    badge: 'bg-rose-100/70 text-rose-800 border-rose-200',
    border: 'border-rose-100/60',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-100'
  },
  amber: {
    cardBg: 'bg-gradient-to-br from-amber-50/70 via-white to-slate-50/50 border-amber-200/90',
    glow: 'bg-amber-500/5',
    titleColor: 'text-amber-900',
    valueColor: 'text-amber-800',
    badge: 'bg-amber-100/70 text-amber-800 border-amber-200',
    border: 'border-amber-100/80',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-100'
  },
  blue: {
    cardBg: 'bg-gradient-to-br from-blue-50/70 via-white to-slate-50/50 border-blue-200/90',
    glow: 'bg-blue-500/5',
    titleColor: 'text-blue-900',
    valueColor: 'text-blue-800',
    badge: 'bg-blue-100/70 text-blue-800 border-blue-200',
    border: 'border-blue-100/80',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-100'
  },
  teal: {
    cardBg: 'bg-gradient-to-br from-teal-50/70 via-white to-slate-50/50 border-teal-100',
    glow: 'bg-teal-500/5',
    titleColor: 'text-teal-900',
    valueColor: 'text-teal-700',
    badge: 'bg-teal-100/70 text-teal-800 border-teal-200',
    border: 'border-teal-100/60',
    iconColor: 'text-teal-700',
    iconBg: 'bg-teal-50 border-teal-200'
  },
  pink: {
    cardBg: 'bg-gradient-to-br from-pink-50/70 via-white to-slate-50/50 border-pink-100',
    glow: 'bg-pink-500/5',
    titleColor: 'text-pink-900',
    valueColor: 'text-pink-700',
    badge: 'bg-pink-100/70 text-pink-800 border-pink-200',
    border: 'border-pink-100/60',
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50 border-pink-200'
  },
  slate: {
    cardBg: 'bg-white border-slate-200',
    glow: 'bg-slate-500/5',
    titleColor: 'text-slate-700',
    valueColor: 'text-slate-900',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    border: 'border-slate-100',
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-50 border-slate-200'
  }
};

/**
 * Reusable StatCard Component
 * Consistent compact font sizing, theme presets, badge indicators,
 * breakdown details, and footer metadata across all pages.
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeBg,
  details,
  footerLeft,
  footerRight,
  trend,
  trendPositive = true,
  variant = 'slate',
  iconColor,
  iconBg,
  onClick,
  className = ''
}) {
  const theme = VARIANTS[variant] || VARIANTS.slate;
  const resolvedIconColor = iconColor || theme.iconColor;
  const resolvedIconBg = iconBg || theme.iconBg;

  return (
    <Card
      variant={onClick ? 'interactive' : 'glass'}
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} shadow-sm flex flex-col justify-between relative overflow-hidden group border ${className}`}
    >
      {/* Ambient background glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${theme.glow} rounded-full blur-2xl pointer-events-none`} />

      <div>
        {/* Top Header: Title, Icon, Badge */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {Icon && (
              <div className={`p-1.5 rounded-lg ${resolvedIconBg} ${resolvedIconColor} border shadow-2xs shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            )}
            <span className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-wider truncate ${theme.titleColor}`}>
              {title}
            </span>
          </div>

          {/* Badge Indicator */}
          {badge && (
            <div className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${badgeBg || theme.badge}`}>
              {badge}
            </div>
          )}
        </div>

        {/* Main Value */}
        <div className={`text-xl sm:text-2xl font-black tracking-tight ${theme.valueColor} group-hover:text-indigo-600 transition-colors`}>
          {value}
        </div>

        {/* Breakdown / Details / Subtitle */}
        {details && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 font-medium">
            {details}
          </div>
        )}

        {!details && subtitle && (
          <p className="mt-0.5 text-[11px] text-slate-500 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Footer / Trend Section */}
      {(footerLeft || footerRight || trend || onClick) && (
        <div className={`mt-3.5 pt-2.5 border-t ${theme.border} flex items-center justify-between text-[11px] sm:text-xs text-slate-600`}>
          {trend ? (
            <div className={`flex items-center gap-1 font-bold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend}</span>
            </div>
          ) : (
            <span className="truncate">{footerLeft || subtitle}</span>
          )}

          {footerRight && (
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold shrink-0 ml-2">
              {footerRight}
            </span>
          )}

          {onClick && !footerRight && (
            <span className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
