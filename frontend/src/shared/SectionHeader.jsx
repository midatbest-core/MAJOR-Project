import React from 'react';
import Badge from './Badge';

const SectionHeader = ({ moduleTag, title, description }) => {
  return (
    <div className="space-y-1">
      {moduleTag && <Badge variant="warning">{moduleTag}</Badge>}
      <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">{title}</h1>
      {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
    </div>
  );
};

export default SectionHeader;
