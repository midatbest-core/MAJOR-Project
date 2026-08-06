import React from 'react';

const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    error: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    neutral: 'bg-slate-800 border-slate-700 text-slate-300'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${variants[variant] || variants.info} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
