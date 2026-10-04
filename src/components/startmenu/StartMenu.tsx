import React, { useState } from 'react';
import {
  Terminal,
  Folder,
  Layers,
  Activity,
  FileText,
  Settings,
  Calculator,
  Search,
  Power,
  RotateCcw,
  User,
  Shield,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { soundService } from '../../services/soundService';
import { vfsService } from '../../services/vfsService';

const APPS_LIST = [
  {
    id: 'architecture',
    name: 'Serverless Architecture',
    desc: 'Neon Postgres, Upstash & FastAPI inspect',
    icon: Layers,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    desc: 'POSIX-compliant shell emulator',
    icon: Terminal,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'explorer',
    name: 'File Explorer',
    desc: 'Browse relational VFS directory hierarchy',
    icon: Folder,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'processes',
    name: 'Task Manager',
    desc: 'Upstash Redis process monitor & kill',
    icon: Activity,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    id: 'editor',
    name: 'Text Editor',
    desc: 'Edit configuration & markdown files',
    icon: FileText,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    props: { filePath: '/home/user/README.md' },
  },
  {
    id: 'calc',
    name: 'Calculator',
    desc: 'Quick desktop arithmetic solver',
    icon: Calculator,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    id: 'settings',
    name: 'Settings',
    desc: 'Wallpapers, audio feedback & VFS reset',
    icon: Settings,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
];

export const StartMenu: React.FC = () => {
  const { isStartMenuOpen, setStartMenuOpen, openApp } = useOS();
  const [search, setSearch] = useState('');

  if (!isStartMenuOpen) return null;

  const handleAppLaunch = (appId: string, props?: Record<string, any>) => {
    soundService.playClick();
    setStartMenuOpen(false);
    openApp(appId, props);
  };

  const filteredApps = APPS_LIST.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 left-3 z-50 w-96 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-xs text-slate-200 animate-fadeIn"
    >
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Type to search apps, files, or settings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Pinned Applications */}
      <div className="p-3 overflow-y-auto max-h-80 space-y-1">
        <div className="text-[10px] font-semibold tracking-wider text-slate-500 px-2 py-1 uppercase">
          Applications
        </div>
        {filteredApps.map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleAppLaunch(item.id, item.props)}
              className="w-full p-2 rounded-lg flex items-center gap-3 hover:bg-slate-800/80 transition-colors text-left group"
            >
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${item.color}`}
              >
                <IconComp className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-200 group-hover:text-white truncate">
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent Files Section */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-[10px] font-semibold tracking-wider text-slate-500 px-2 pb-1.5 uppercase">
          Quick Documents
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAppLaunch('editor', { filePath: '/home/user/README.md' })}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-850 flex items-center gap-2 text-left truncate"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate text-[11px]">README.md</span>
          </button>
          <button
            onClick={() => handleAppLaunch('editor', { filePath: '/home/user/system.conf' })}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-850 flex items-center gap-2 text-left truncate"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-[11px]">system.conf</span>
          </button>
        </div>
      </div>

      {/* User Footer & Power Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-sky-600/30 border border-sky-500/50 flex items-center justify-center text-sky-300 font-semibold text-xs">
            U
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-200 leading-tight">user@aether</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              <span>Serverless Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              vfsService.resetToDefaults();
              window.location.reload();
            }}
            title="Reboot Web OS"
            className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStartMenuOpen(false)}
            title="Lock Session"
            className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
