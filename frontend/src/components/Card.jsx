import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Card Component with Deep Tangible 3D Box Shadow
 * Variants:
 *  - 'glass': Clean white card with rich elevation shadow depth
 *  - 'interactive': High lift (-6px) and prominent colored bloom shadow on hover
 *  - 'accent': Top radiant ambient bar
 *  - 'compact': Slimmer padding for widgets
 */
export default function Card({
  children,
  variant = 'glass',
  accentColor = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet'
  className = '',
  onClick,
  ...props
}) {
  const isInteractive = variant === 'interactive' || !!onClick;

  const accentBars = {
    indigo: 'from-indigo-500 via-blue-500 to-cyan-400',
    emerald: 'from-emerald-400 to-teal-500',
    amber: 'from-amber-400 to-orange-500',
    rose: 'from-pink-500 to-rose-600',
    violet: 'from-violet-500 to-purple-600'
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={
        isInteractive
          ? {
              y: -6,
              boxShadow:
                '0 35px 70px -15px rgba(79, 70, 229, 0.28), 0 20px 35px -8px rgba(15, 23, 42, 0.18), 0 6px 12px -3px rgba(15, 23, 42, 0.10), 0 0 0 2px rgba(99, 102, 241, 0.45)',
              borderColor: 'rgba(99, 102, 241, 0.45)',
              transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
            }
          : {}
      }
      className={`
        relative rounded-3xl border border-slate-200/90 bg-white overflow-hidden
        ${isInteractive ? 'cursor-pointer' : ''}
        ${variant === 'compact' ? 'p-4 sm:p-5' : 'p-6 sm:p-8'}
        transition-all duration-300
        ${className}
      `}
      style={{
        boxShadow:
          '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 12px 24px -6px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.85)'
      }}
      {...props}
    >
      {/* Specular Top Reflection Sheen */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(90deg, rgba(226, 232, 240, 0) 0%, rgba(226, 232, 240, 0.8) 25%, rgba(99, 102, 241, 0.25) 50%, rgba(226, 232, 240, 0.8) 75%, rgba(226, 232, 240, 0) 100%)'
        }}
      />

      {/* Optional Top Glowing Accent Bar */}
      {variant === 'accent' && (
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${accentBars[accentColor] || accentBars.indigo}`}
        />
      )}

      {children}
    </motion.div>
  );
}

// Subcomponent: Card Header
export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

// Subcomponent: Card Title
export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-extrabold text-slate-900 tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

// Subcomponent: Card Description
export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

// Subcomponent: Card Content
export function CardContent({ children, className = '' }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

// Subcomponent: Card Footer
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-6 pt-4 border-t border-slate-100 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}
