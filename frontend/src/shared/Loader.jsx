import React from 'react';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-400 animate-pulse">{text}</p>
    </div>
  );
};

export default Loader;
