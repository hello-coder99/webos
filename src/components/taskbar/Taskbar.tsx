import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Folder,
  Layers,
  Activity,
  FileText,
  Settings,
  Calculator,
  Square,
  Radio,
  Volume2,
  VolumeX,
  Bell,
  Cpu,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { soundService } from '../../services/soundService';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal,
  Folder,
  Layers,
  Activity,
  FileText,
  Settings,
  Calculator,
};

export const Taskbar: React.FC<{ onToggleNotifications: () => void; unreadNotifs: number }> = ({
  onToggleNotifications,
  unreadNotifs,
}) => {
  const {
    windows,
    activeWindowId,
    focusWindow,
    minimizeWindow,
    isStartMenuOpen,
    setStartMenuOpen,
    systemMetrics,
  } = useOS();

  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isMuted, setIsMuted] = useState(!soundService.isEnabled());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playClick();
    setStartMenuOpen((prev) => !prev);
  };

  const handleTaskbarItemClick = (winId: string) => {
    soundService.playClick();
    const win = windows.find((w) => w.id === winId);
    if (!win) return;

    if (activeWindowId === winId && !win.isMinimized) {
      minimizeWindow(winId);
    } else {
      focusWindow(winId);
    }
  };

  const toggleSound = () => {
    const next = isMuted;
    soundService.setEnabled(next);
    setIsMuted(!next);
    if (next) soundService.playClick();
  };

  return (
    <div className="h-12 w-full bg-slate-950/85 backdrop-blur-2xl border-t border-slate-800/80 flex items-center justify-between px-3 z-40 select-none">
      {/* Left Zone: Start Button & Active Window Tabs */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Start Button */}
        <button
          onClick={handleStartClick}
          className={`h-9 px-3 rounded-md flex items-center gap-2 font-semibold text-xs transition-all ${
            isStartMenuOpen
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
          }`}
        >
          {/* Stylized OS Logo */}
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            <div className="bg-sky-400 rounded-sm" />
            <div className="bg-emerald-400 rounded-sm" />
            <div className="bg-purple-400 rounded-sm" />
            <div className="bg-amber-400 rounded-sm" />
          </div>
          <span className="font-semibold tracking-wide">Aether</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1 shrink-0" />

        {/* Active Windows List */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {windows.map((win) => {
            const IconComp = ICON_MAP[win.icon] || Square;
            const isFocused = activeWindowId === win.id && !win.isMinimized;
            return (
              <button
                key={win.id}
                onClick={() => handleTaskbarItemClick(win.id)}
                className={`h-8 max-w-[180px] px-2.5 rounded flex items-center gap-2 text-xs transition-all relative border ${
                  isFocused
                    ? 'bg-slate-800/90 border-slate-600 text-white shadow-sm'
                    : win.isMinimized
                    ? 'bg-slate-950/60 border-slate-900 text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 shrink-0 ${isFocused ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate">{win.title}</span>
                {isFocused && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-sky-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Zone: System Tray */}
      <div className="flex items-center gap-2.5 shrink-0 text-slate-400 text-xs">
        {/* Realtime IPC status */}
        <div
          title="Pusher / Supabase Realtime IPC Active"
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-[11px]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <Radio className="w-3 h-3 text-sky-400" />
          <span className="font-mono text-slate-300">IPC Live</span>
        </div>

        {/* Serverless Metrics tooltip */}
        <div
          title={`Total Processes: ${systemMetrics.totalProcesses} | CPU: ${systemMetrics.totalCpuPercent}`}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/80 border border-slate-800 font-mono text-[11px] text-slate-300"
        >
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span>{systemMetrics.totalCpuPercent}</span>
          <span className="text-slate-600">|</span>
          <span>{systemMetrics.totalMemoryMb}M</span>
        </div>

        {/* Volume toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Notifications toggle */}
        <button
          onClick={onToggleNotifications}
          title="Notifications"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifs > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-500" />
          )}
        </button>

        {/* Clock & Calendar */}
        <div className="flex flex-col items-end px-2 py-0.5 rounded hover:bg-slate-800/60 cursor-default transition-colors">
          <span className="font-mono font-medium text-xs text-slate-200 tabular-nums leading-tight">
            {time}
          </span>
          <span className="text-[10px] text-slate-400 leading-tight">
            {date}
          </span>
        </div>
      </div>
    </div>
  );
};
