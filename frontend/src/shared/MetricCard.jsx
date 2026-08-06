import React from 'react';

const MetricCard = ({ title, value, subtext, icon: Icon, iconColor = 'text-blue-400', className = '' }) => {
  return (
    <div className={`p-4 rounded-xl bg-slate-900/60 border border-slate-800 ${className}`}>
      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
        {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
        <span>{title}</span>
      </div>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
      {subtext && <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">{subtext}</span>}
    </div>
  );
};

export default MetricCard;
