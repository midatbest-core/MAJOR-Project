import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Subtitles, 
  Sparkles, 
  Download, 
  Settings as SettingsIcon,
  Cpu
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', name: 'Home', icon: Home },
    { path: '/text-studio', name: 'Text Studio', icon: FileText, badge: 'Stage 1 & 2' },
    { path: '/caption-studio', name: 'Caption Studio', icon: Subtitles, badge: 'Stage 3' },
    { path: '/creator-intelligence', name: 'Creator Intelligence', icon: Sparkles, badge: 'Stage 4' },
    { path: '/downloads', name: 'Downloads', icon: Download },
    { path: '/settings', name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/60 flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight text-white">AI Creator</h1>
            <span className="text-xs text-brand-400 font-medium">Dashboard v1.0</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/90 to-purple-600/90 text-white shadow-md shadow-brand-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-brand-300 border border-slate-700/50">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Cost Optimization Footnote */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
        <div className="flex items-center justify-between text-emerald-400 font-semibold mb-1">
          <span>Cost Status</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Local Whisper & spaCy active. API overhead: <span className="text-emerald-400 font-bold">$0.00</span>
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
