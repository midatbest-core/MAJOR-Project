import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Database, Key, Server, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [pythonExe, setPythonExe] = useState('python');

  useEffect(() => {
    const savedGeminiKey = localStorage.getItem('GEMINI_API_KEY') || '';
    const savedYoutubeKey = localStorage.getItem('YOUTUBE_API_KEY') || '';
    const savedPythonPath = localStorage.getItem('PYTHON_PATH') || 'python';
    
    setApiKey(savedGeminiKey);
    setYoutubeKey(savedYoutubeKey);
    setPythonExe(savedPythonPath);
  }, []);

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    localStorage.setItem('YOUTUBE_API_KEY', youtubeKey);
    localStorage.setItem('PYTHON_PATH', pythonExe);
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure LLM keys, python executable path, and database connections.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-w-2xl">
        {/* YouTube API Key */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-red-500" />
            <span>YouTube Data API v3 Key</span>
          </label>
          <input
            type="password"
            value={youtubeKey}
            onChange={(e) => setYoutubeKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
          />
          <p className="text-slate-500 text-xs">Required for fetching video statistics and comments in the Creator Intelligence module.</p>
        </div>

        {/* Gemini API Key */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-brand-400" />
            <span>Google Gemini API Key</span>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
          />
          <p className="text-slate-500 text-xs">Used for Title, Description, and Hook generation, and audience intelligence.</p>
        </div>

        {/* Python Executable Path */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span>Python Executable Path</span>
          </label>
          <input
            type="text"
            value={pythonExe}
            onChange={(e) => setPythonExe(e.target.value)}
            placeholder="python"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
          />
          <p className="text-slate-500 text-xs">Specify system python binary or virtual environment path (e.g. `backend/venv/bin/python`).</p>
        </div>

        {/* MongoDB Connection Status */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white">MongoDB Storage Policy</p>
              <p className="text-xs text-slate-400">Stores only JSON metadata, transcripts, and AI suggestions.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            Active
          </span>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
