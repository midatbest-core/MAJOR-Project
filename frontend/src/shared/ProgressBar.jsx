import React from 'react';

const ProgressBar = ({ label, percentage = 0, color = 'bg-amber-500', textColor = 'text-amber-400' }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-300 font-medium">
        <span>{label}</span>
        <span className={`font-bold ${textColor}`}>{percentage}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
