import React from 'react';

const MetricCard = ({ title, value, unit, subtext, icon, iconColor = 'text-indigo-400', className = '' }) => {
  const displaySubtext = subtext || unit;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComponent = icon;
      return <IconComponent className={`w-4 h-4 ${iconColor}`} />;
    }
    return null;
  };

  return (
    <div className={`p-4 rounded-xl bg-slate-900/60 border border-slate-800 ${className}`}>
      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
        {renderIcon()}
        <span>{title}</span>
      </div>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
      {displaySubtext && (
        <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
          {displaySubtext}
        </span>
      )}
    </div>
  );
};

export default MetricCard;
