import React from 'react';
import { Palette, Sparkles, MoveVertical, EyeOff } from 'lucide-react';

/**
 * Style Panel Component conforming to Chapter 7 Specs
 * Professional Creator Presets (Hormozi, MrBeast, Ali Abdaal, Classic, Bold, Minimal, Gaming, Podcast, Modern, Cinema, Neon, Creator, Clean)
 * with fine-grained Transparent Background, Opacity, Stroke Color, Font Weight, and Shadow customization.
 */
const StylePanel = ({ style, onChangeStyle }) => {

  // Instagram, TikTok & YouTube Creator Presets
  const presets = [
    {
      name: 'Hormozi 🔥',
      style: {
        fontFamily: 'Impact',
        fontSize: 30,
        fontWeight: '900',
        primaryColor: '#FFE600',
        backgroundColor: 'transparent',
        backgroundOpacity: 0,
        transparentBg: true,
        strokeColor: '#000000',
        strokeWidth: 3,
        shadowOffset: 4,
        shadowColor: 'rgba(0,0,0,0.9)',
        uppercase: true,
        animation: 'scale-up',
        highlightColor: '#FFFFFF',
        position: 'bottom'
      }
    },
    {
      name: 'MrBeast ⚡',
      style: {
        fontFamily: 'Bangers',
        fontSize: 32,
        fontWeight: '900',
        primaryColor: '#FFFFFF',
        backgroundColor: 'transparent',
        backgroundOpacity: 0,
        transparentBg: true,
        strokeColor: '#000000',
        strokeWidth: 3,
        shadowOffset: 4,
        shadowColor: 'rgba(0,0,0,0.9)',
        uppercase: true,
        animation: 'bounce',
        highlightColor: '#FFEA00',
        position: 'bottom'
      }
    },
    {
      name: 'Ali Abdaal ☕',
      style: {
        fontFamily: 'Montserrat',
        fontSize: 24,
        fontWeight: '600',
        primaryColor: '#FFFFFF',
        backgroundColor: '#1E293B',
        backgroundOpacity: 0.55,
        transparentBg: false,
        strokeWidth: 0,
        shadowOffset: 1,
        shadowColor: 'rgba(0,0,0,0.5)',
        uppercase: false,
        animation: 'none',
        position: 'bottom'
      }
    },
    {
      name: 'Classic',
      style: {
        fontFamily: 'Inter',
        fontSize: 24,
        fontWeight: '700',
        primaryColor: '#FFFFFF',
        backgroundColor: '#000000',
        backgroundOpacity: 0.75,
        transparentBg: false,
        strokeWidth: 0,
        shadowOffset: 2,
        position: 'bottom'
      }
    },
    {
      name: 'Bold',
      style: {
        fontFamily: 'Impact',
        fontSize: 28,
        fontWeight: '900',
        primaryColor: '#FFD700',
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        transparentBg: false,
        strokeColor: '#000000',
        strokeWidth: 3,
        shadowOffset: 4,
        uppercase: true,
        position: 'bottom'
      }
    },
    {
      name: 'Minimal',
      style: {
        fontFamily: 'Inter',
        fontSize: 22,
        fontWeight: '600',
        primaryColor: '#F8FAFC',
        backgroundColor: 'transparent',
        backgroundOpacity: 0,
        transparentBg: true,
        strokeWidth: 0,
        shadowOffset: 1,
        shadowColor: 'rgba(0,0,0,0.6)',
        position: 'bottom'
      }
    },
    {
      name: 'Gaming',
      style: {
        fontFamily: 'Outfit',
        fontSize: 28,
        fontWeight: '800',
        primaryColor: '#00FF66',
        backgroundColor: '#09090B',
        backgroundOpacity: 0.85,
        transparentBg: false,
        strokeColor: '#000000',
        strokeWidth: 2,
        shadowOffset: 4,
        uppercase: true,
        position: 'bottom'
      }
    },
    {
      name: 'Podcast',
      style: {
        fontFamily: 'Outfit',
        fontSize: 26,
        fontWeight: '700',
        primaryColor: '#FFFFFF',
        backgroundColor: '#4F46E5',
        backgroundOpacity: 0.9,
        transparentBg: false,
        strokeWidth: 0,
        shadowOffset: 3,
        position: 'bottom'
      }
    },
    {
      name: 'Modern',
      style: {
        fontFamily: 'Inter',
        fontSize: 26,
        fontWeight: '700',
        primaryColor: '#38BDF8',
        backgroundColor: '#0F172A',
        backgroundOpacity: 0.8,
        transparentBg: false,
        strokeWidth: 1,
        strokeColor: '#0284C7',
        shadowOffset: 2,
        position: 'bottom'
      }
    },
    {
      name: 'Neon',
      style: {
        fontFamily: 'Outfit',
        fontSize: 28,
        fontWeight: '800',
        primaryColor: '#F43F5E',
        backgroundColor: '#18181B',
        backgroundOpacity: 0.9,
        transparentBg: false,
        strokeColor: '#FB7185',
        strokeWidth: 2,
        shadowOffset: 6,
        shadowColor: 'rgba(244,63,94,0.8)',
        uppercase: true,
        position: 'bottom'
      }
    }
  ];

  const handleUpdate = (field, value) => {
    onChangeStyle({ ...style, [field]: value });
  };

  const applyPreset = (presetStyle) => {
    onChangeStyle({ ...style, ...presetStyle });
  };

  const isTransparent = style.transparentBg === true || 
    style.backgroundOpacity === 0 || 
    style.backgroundColor === 'transparent' || 
    !style.backgroundColor;

  return (
    <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 backdrop-blur-md shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-400" />
          <span>Caption Style & Typography</span>
        </div>
        <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
          v2.0 Pro
        </span>
      </div>

      {/* Preset Selector Grid */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Creator Presets (1-Click)
          </span>
          <span className="text-[9px] text-slate-500">TikTok • Reels • Shorts</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p.style)}
              className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-[10px] font-medium text-slate-300 hover:text-white transition text-center truncate shadow-sm active:scale-95"
              title={`Apply ${p.name} style`}
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
              <option value="Outfit">Outfit (Clean Sans)</option>
              <option value="Inter">Inter (Modern)</option>
              <option value="Impact">Impact (Bold Viral)</option>
              <option value="Montserrat">Montserrat (Editorial)</option>
              <option value="Bangers">Bangers (Comic Pop)</option>
              <option value="Poppins">Poppins (Friendly)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-slate-400">Font Size</label>
              <span className="font-mono text-[10px] text-indigo-400">{style.fontSize || 28}px</span>
            </div>
            <input
              type="range"
              min={14}
              max={48}
              value={style.fontSize || 28}
              onChange={(e) => handleUpdate('fontSize', parseInt(e.target.value))}
              className="accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* Font Weight & Letter Spacing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Font Weight</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => handleUpdate('fontWeight', '500')}
                className={`py-1 text-[10px] font-medium rounded ${(style.fontWeight === '500' || style.fontWeight === 'normal') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('fontWeight', '700')}
                className={`py-1 text-[10px] font-bold rounded ${(style.fontWeight === '700' || style.fontWeight === 'bold' || !style.fontWeight) ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('fontWeight', '900')}
                className={`py-1 text-[10px] font-black rounded ${style.fontWeight === '900' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Black
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Letter Spacing</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => handleUpdate('letterSpacing', -0.5)}
                className={`py-1 text-[10px] rounded ${style.letterSpacing === -0.5 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Tight
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('letterSpacing', 0)}
                className={`py-1 text-[10px] rounded ${(style.letterSpacing === 0 || !style.letterSpacing) ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('letterSpacing', 1.5)}
                className={`py-1 text-[10px] rounded ${style.letterSpacing === 1.5 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Wide
              </button>
            </div>
          </div>
        </div>

        {/* Text Color & Background Controls */}
        <div className="grid grid-cols-2 gap-3">
          {/* Primary Text Color */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Text Color</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
              <input
                type="color"
                value={style.primaryColor || '#FFFFFF'}
                onChange={(e) => handleUpdate('primaryColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[10px] text-slate-300">{style.primaryColor || '#FFFFFF'}</span>
              
              {/* Quick Color Chips */}
              <div className="ml-auto flex items-center gap-1">
                {['#FFFFFF', '#FFE600', '#00FF88', '#38BDF8'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleUpdate('primaryColor', c)}
                    style={{ backgroundColor: c }}
                    className="w-3.5 h-3.5 rounded-full border border-white/20 hover:scale-110 transition"
                    title={`Set color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Background Box & Transparent Option */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-slate-400">Background Box</label>
              <button
                type="button"
                onClick={() => {
                  if (isTransparent) {
                    handleUpdate('transparentBg', false);
                    handleUpdate('backgroundOpacity', 0.8);
                    handleUpdate('backgroundColor', '#000000');
                  } else {
                    handleUpdate('transparentBg', true);
                    handleUpdate('backgroundOpacity', 0);
                    handleUpdate('backgroundColor', 'transparent');
                  }
                }}
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition border ${
                  isTransparent
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Toggle transparent background"
              >
                {isTransparent ? '✓ Transparent' : 'Make Transparent'}
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
              {isTransparent ? (
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] py-0.5 px-1 w-full">
                  <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">No Box (100% Transparent)</span>
                </div>
              ) : (
                <>
                  <input
                    type="color"
                    value={style.backgroundColor && style.backgroundColor !== 'transparent' ? style.backgroundColor : '#000000'}
                    onChange={(e) => {
                      handleUpdate('backgroundColor', e.target.value);
                      handleUpdate('transparentBg', false);
                      if (!style.backgroundOpacity) handleUpdate('backgroundOpacity', 0.8);
                    }}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-slate-300">{style.backgroundColor}</span>
                  
                  {/* Quick Color Chips */}
                  <div className="ml-auto flex items-center gap-1">
                    {['#000000', '#1E293B', '#4F46E5', '#EC4899'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          handleUpdate('backgroundColor', c);
                          handleUpdate('transparentBg', false);
                        }}
                        style={{ backgroundColor: c }}
                        className="w-3.5 h-3.5 rounded-full border border-white/20 hover:scale-110 transition"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Background Opacity Slider (when not transparent) */}
        {!isTransparent && (
          <div className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Box Opacity</span>
              <span className="font-mono text-indigo-400">{Math.round((style.backgroundOpacity ?? 0.8) * 100)}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={Math.round((style.backgroundOpacity ?? 0.8) * 100)}
              onChange={(e) => {
                const val = parseInt(e.target.value) / 100;
                handleUpdate('backgroundOpacity', val);
              }}
              className="accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Stroke Border (Color + Width) */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-slate-400">Stroke Border</label>
              <span className="font-mono text-[10px] text-indigo-400">{style.strokeWidth || 0}px</span>
            </div>
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
            <label className="text-[10px] font-medium text-slate-400">Stroke Color</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <input
                type="color"
                value={style.strokeColor || '#000000'}
                onChange={(e) => handleUpdate('strokeColor', e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[10px] text-slate-300">{style.strokeColor || '#000000'}</span>
              
              <div className="ml-auto flex items-center gap-1">
                {['#000000', '#FFFFFF', '#FFE600', '#00FFFF'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleUpdate('strokeColor', c)}
                    style={{ backgroundColor: c }}
                    className="w-3 h-3 rounded-full border border-white/20"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Drop Shadow & Distance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-slate-400">Drop Shadow</label>
              <span className="font-mono text-[10px] text-indigo-400">{style.shadowOffset || 0}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={style.shadowOffset || 0}
              onChange={(e) => handleUpdate('shadowOffset', parseInt(e.target.value))}
              className="accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer mt-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Shadow Style</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  handleUpdate('shadowOffset', 0);
                  handleUpdate('shadowColor', 'transparent');
                }}
                className={`py-1 text-[10px] rounded ${(style.shadowOffset === 0) ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                None
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdate('shadowOffset', 3);
                  handleUpdate('shadowColor', 'rgba(0,0,0,0.7)');
                }}
                className={`py-1 text-[10px] rounded ${(style.shadowOffset === 3) ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Soft
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdate('shadowOffset', 5);
                  handleUpdate('shadowColor', 'rgba(0,0,0,0.95)');
                }}
                className={`py-1 text-[10px] rounded ${(style.shadowOffset >= 5) ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Hard 3D
              </button>
            </div>
          </div>
        </div>

        {/* Position & Uppercase */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400">Vertical Position</label>
            <select
              value={style.position || 'bottom'}
              onChange={(e) => {
                const pos = e.target.value;
                if (pos !== 'custom') {
                  handleUpdate('posX', 50);
                  handleUpdate('posY', pos === 'top' ? 15 : (pos === 'center' ? 50 : 75));
                }
                handleUpdate('position', pos);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="bottom">Bottom (75% Sweet Spot)</option>
              <option value="center">Middle (Center)</option>
              <option value="top">Top (Header)</option>
              {style.position === 'custom' && <option value="custom">Custom (Free Drag)</option>}
            </select>
          </div>

          <div className="flex flex-col gap-1 justify-end">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 hover:border-indigo-500/40 transition">
              <input
                type="checkbox"
                checked={style.uppercase || false}
                onChange={(e) => handleUpdate('uppercase', e.target.checked)}
                className="accent-indigo-500 rounded cursor-pointer"
              />
              <span className="text-[11px] font-medium text-slate-300">UPPERCASE</span>
            </label>
          </div>
        </div>

        {/* Animation & Word Highlighting */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
              <MoveVertical className="w-3 h-3 text-emerald-400" /> Word Animation
            </label>
            <select
              value={style.animation || 'none'}
              onChange={(e) => handleUpdate('animation', e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="none">None (Static)</option>
              <option value="scale-up">Scale Up Word (Hormozi)</option>
              <option value="bounce">Bounce Word (MrBeast)</option>
              <option value="highlight">Color Highlight Word</option>
              <option value="karaoke">Karaoke Fill</option>
              <option value="typewriter">Typewriter</option>
            </select>
          </div>

          {['highlight', 'karaoke', 'scale-up', 'bounce'].includes(style.animation) && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-slate-400">Word Accent Color</label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <input
                  type="color"
                  value={style.highlightColor || '#FFD700'}
                  onChange={(e) => handleUpdate('highlightColor', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="font-mono text-[10px] text-slate-300">{style.highlightColor || '#FFD700'}</span>
                
                <div className="ml-auto flex items-center gap-1">
                  {['#FFD700', '#00FF66', '#FF0055', '#00E5FF'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleUpdate('highlightColor', c)}
                      style={{ backgroundColor: c }}
                      className="w-3 h-3 rounded-full border border-white/20"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StylePanel;
