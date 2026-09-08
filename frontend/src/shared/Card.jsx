import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`glass-panel p-6 rounded-2xl border border-slate-800 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-slate-800/80 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export default Card;
