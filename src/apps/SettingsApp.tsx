import React, { useState } from 'react';
import { Settings, Image, Volume2, VolumeX, RotateCcw, ShieldCheck, Database } from 'lucide-react';
import { useOS } from '../context/OSContext';
import { soundService } from '../services/soundService';
import { vfsService } from '../services/vfsService';

export const SettingsApp: React.FC = () => {
  const { wallpaper, setWallpaper } = useOS();
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());
  const [resetMessage, setResetMessage] = useState('');

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundService.setEnabled(next);
    if (next) soundService.playClick();
  };

  const handleResetVFS = () => {
    if (confirm('Reset Virtual File System to clean state? All custom files will be restored to defaults.')) {
      vfsService.resetToDefaults();
      setResetMessage('Virtual File System reset to clean state.');
      setTimeout(() => setResetMessage(''), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 text-xs p-4 overflow-y-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <Settings className="w-5 h-5 text-sky-400" />
        <h2 className="text-sm font-semibold text-slate-100">System Preferences & Settings</h2>
      </div>

      {/* Wallpaper Picker */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Image className="w-3.5 h-3.5 text-sky-400" />
          <span>Desktop Wallpaper</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setWallpaper('photo')}
            className={`p-2 rounded border text-left flex flex-col gap-1 transition-all ${
              wallpaper === 'photo'
                ? 'border-sky-500 bg-sky-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <div className="h-16 w-full rounded bg-slate-800 border border-slate-700 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 opacity-90" />
              <div className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/60 px-1 rounded text-sky-300">
                Obsidian Studio
              </div>
            </div>
            <span className="font-medium text-xs">Cinematic Studio</span>
          </button>

          <button
            onClick={() => setWallpaper('aurora')}
            className={`p-2 rounded border text-left flex flex-col gap-1 transition-all ${
              wallpaper === 'aurora'
                ? 'border-sky-500 bg-sky-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <div className="h-16 w-full rounded bg-gradient-to-tr from-indigo-950 via-slate-900 to-emerald-950 border border-slate-700 relative">
              <div className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/60 px-1 rounded text-emerald-300">
                Aurora
              </div>
            </div>
            <span className="font-medium text-xs">Northern Lights</span>
          </button>

          <button
            onClick={() => setWallpaper('obsidian')}
            className={`p-2 rounded border text-left flex flex-col gap-1 transition-all ${
              wallpaper === 'obsidian'
                ? 'border-sky-500 bg-sky-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <div className="h-16 w-full rounded bg-slate-950 border border-slate-800 relative">
              <div className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/60 px-1 rounded text-slate-400">
                Obsidian
              </div>
            </div>
            <span className="font-medium text-xs">Deep Slate</span>
          </button>
        </div>
      </div>

      {/* Audio Preferences */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>Synthesized Web Audio Feedback</span>
        </label>
        <div className="flex items-center justify-between p-3 rounded border border-slate-800 bg-slate-900/60">
          <div>
            <div className="font-medium text-slate-200">Window & Terminal Sound Effects</div>
            <div className="text-[11px] text-slate-500">
              Low-latency sound cues synthesized using Web Audio oscillators.
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>
      </div>

      {/* VFS Maintenance */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>VFS Storage & Reset</span>
        </label>
        <div className="flex items-center justify-between p-3 rounded border border-slate-800 bg-slate-900/60">
          <div>
            <div className="font-medium text-slate-200">Re-seed Virtual File System</div>
            <div className="text-[11px] text-slate-500">
              Restore default directories, configurations, and documentation files.
            </div>
            {resetMessage && (
              <div className="text-emerald-400 text-[11px] mt-1 font-semibold">{resetMessage}</div>
            )}
          </div>
          <button
            onClick={handleResetVFS}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset DB</span>
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="p-3 rounded border border-slate-800 bg-slate-900/40 text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>AetherOS Runtime Specification</span>
        </div>
        <div>Kernel: v1.0.0-serverless (FastAPI ASGI + Neon Postgres)</div>
        <div>Compositor: React 19 DOM Window Layer</div>
        <div>Cache: Upstash Redis REST Driver</div>
      </div>
    </div>
  );
};
