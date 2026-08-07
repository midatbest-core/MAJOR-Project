import React from 'react';
import { Palette, Type, Sliders, Sparkles, Layers, MoveVertical } from 'lucide-react';

/**
 * Style Panel Component conforming to Chapter 7 Specs
 * 10 Presets (Classic, Bold, Minimal, Gaming, Podcast, Modern, Cinema, Neon, Creator, Clean) + customization controls.
 */
const StylePanel = ({ style, onChangeStyle }) => {

  // 10 Instagram & CapCut Inspired Presets
  const presets = [
    {
      name: 'Classic',
      style: { fontFamily: 'Inter', fontSize: 24, primaryColor: '#FFFFFF', backgroundColor: '#000000', backgroundOpacity: 0.75, strokeWidth: 0, shadowOffset: 2, position: 'bottom' }
    },
    {
      name: 'Bold',
      style: { fontFamily: 'Impact', fontSize: 28, primaryColor: '#FFD700', backgroundColor: '#000000', backgroundOpacity: 0.9, strokeColor: '#000000', strokeWidth: 3, shadowOffset: 4, uppercase: true, position: 'bottom' }
    },
    {
      name: 'Minimal',
      style: { fontFamily: 'Inter', fontSize: 20, primaryColor: '#F8FAFC', backgroundColor: '', backgroundOpacity: 0, strokeWidth: 0, shadowOffset: 0, position: 'bottom' }
    },
    {
      name: 'Gaming',
      style: { fontFamily: 'Outfit', fontSize: 28, primaryColor: '#00FF66', backgroundColor: '#09090B', backgroundOpacity: 0.85, strokeColor: '#000000', strokeWidth: 2, shadowOffset: 4, uppercase: true, position: 'bottom' }
    },
    {
      name: 'Podcast',
      style: { fontFamily: 'Outfit', fontSize: 26, primaryColor: '#FFFFFF', backgroundColor: '#4F46E5', backgroundOpacity: 0.9, strokeWidth: 0, shadowOffset: 3, position: 'bottom' }
    },
    {
      name: 'Modern',
      style: { fontFamily: 'Inter', fontSize: 26, primaryColor: '#38BDF8', backgroundColor: '#0F172A', backgroundOpacity: 0.8, strokeWidth: 1, strokeColor: '#0284C7', shadowOffset: 2, position: 'bottom' }
    },
    {
      name: 'Cinema',
      style: { fontFamily: 'Inter', fontSize: 22, primaryColor: '#FEF08A', backgroundColor: '#000000', backgroundOpacity: 0.6, strokeWidth: 0, shadowOffset: 1, position: 'bottom' }
    },
    {
      name: 'Neon',
      style: { fontFamily: 'Outfit', fontSize: 28, primaryColor: '#F43F5E', backgroundColor: '#18181B', backgroundOpacity: 0.9, strokeColor: '#FB7185', strokeWidth: 2, shadowOffset: 6, shadowColor: 'rgba(244,63,94,0.8)', uppercase: true, position: 'bottom' }
    },
    {
      name: 'Creator',
      style: { fontFamily: 'Outfit', fontSize: 26, primaryColor: '#FAFAFA', backgroundColor: '#EC4899', backgroundOpacity: 0.9, strokeWidth: 0, shadowOffset: 3, uppercase: false, position: 'bottom' }
    },
    {
      name: 'Clean',
      style: { fontFamily: 'Inter', fontSize: 24, primaryColor: '#1E293B', backgroundColor: '#F8FAFC', backgroundOpacity: 0.95, strokeWidth: 0, shadowOffset: 2, position: 'bottom' }
    }
  ];

  const handleUpdate = (field, value) => {
    onChangeStyle({ ...style, [field]: value });
  };

  const applyPreset = (presetStyle) => {
    onChangeStyle({ ...style, ...presetStyle });
  };

  return (
    <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 backdrop-blur-md shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
        <Palette className="w-4 h-4 text-indigo-400" />
        <span>Caption Style & Typography System</span>
      </div>

      {/* Preset Selector Grid */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Style Presets (1-Click)
        </span>

        <div className="grid grid-cols-5 gap-1.5">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p.style)}
              className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-[10px] font-medium text-slate-300 hover:text-white transition text-center truncate"
              title={`Apply ${p.name} preset`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Fine-Grained Typography & Style Controls */}
      <div className="space-y-3.5 text-xs">
        {/* Font Family & Size */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Font Family</label>
            <select
              value={style.fontFamily || 'Outfit'}
              onChange={(e) => handleUpdate('fontFamily', e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="Outfit">Outfit</option>
              <option value="Inter">Inter</option>
              <option value="Impact">Impact</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Bangers">Bangers</option>
              <option value="Poppins">Poppins</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Font Size ({style.fontSize || 24}px)</label>
            <input
              type="range"
              min={14}
              max={48}
              value={style.fontSize || 24}
              onChange={(e) => handleUpdate('fontSize', parseInt(e.target.value))}
              className="accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Text Color & Background Box */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Text Color</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <input
                type="color"
                value={style.primaryColor || '#FFFFFF'}
                onChange={(e) => handleUpdate('primaryColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[10px] text-slate-300">{style.primaryColor || '#FFFFFF'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Background Box</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <input
                type="color"
                value={style.backgroundColor || '#000000'}
                onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[10px] text-slate-300">
                {style.backgroundColor || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Position & Uppercase */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Vertical Position</label>
            <select
              value={style.position || 'bottom'}
              onChange={(e) => handleUpdate('position', e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="top">Top</option>
              <option value="center">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 justify-end">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
              <input
                type="checkbox"
                checked={style.uppercase || false}
                onChange={(e) => handleUpdate('uppercase', e.target.checked)}
                className="accent-indigo-500 rounded"
              />
              <span className="text-[11px] font-medium text-slate-300">UPPERCASE</span>
            </label>
          </div>
        </div>

        {/* Stroke Border & Drop Shadow Sliders */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Stroke Border ({style.strokeWidth || 0}px)</label>
            <input
              type="range"
              min={0}
              max={6}
              value={style.strokeWidth || 0}
              onChange={(e) => handleUpdate('strokeWidth', parseInt(e.target.value))}
              className="accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer mt-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Drop Shadow ({style.shadowOffset || 0}px)</label>
            <input
              type="range"
              min={0}
              max={10}
              value={style.shadowOffset || 0}
              onChange={(e) => handleUpdate('shadowOffset', parseInt(e.target.value))}
              className="accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylePanel;
