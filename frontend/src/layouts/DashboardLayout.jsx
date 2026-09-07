import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard,
  FileText,
  Subtitles,
  Sparkles,
  Settings,
  Menu,
  X,
  Zap,
  Activity,
  MessageSquare
} from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Text Studio', path: '/text-studio', icon: FileText },
    { label: 'Caption Studio', path: '/caption-studio', icon: Subtitles },
    { label: 'Creator Intelligence', path: '/creator-intelligence', icon: Sparkles },
    { label: 'AI Chatbot', path: '/ai-chatbot', icon: MessageSquare },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block leading-none">
                AI Creator Dashboard
              </span>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block mt-0.5">
                v2.0 • B.Tech Final Year
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Backend Engine Online</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-20 w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800/80 p-4 transition-transform duration-200 transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col justify-between mt-16 md:mt-0
        `}>
          <div className="space-y-1">
            <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
              Navigation Menu
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition
                    ${isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1 text-xs">
            <span className="font-bold text-slate-300 block">Open Source Stack</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Whisper STT • spaCy NLP • FFmpeg Rendering • React 19
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
