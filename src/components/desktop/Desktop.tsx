import React, { useState } from 'react';
import { Terminal, Folder, Layers, Activity, FileText, Settings, Calculator, Plus, RotateCcw } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { soundService } from '../../services/soundService';
import { vfsService } from '../../services/vfsService';

interface DesktopIconItem {
  id: string;
  appId: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  props?: Record<string, any>;
}

const DESKTOP_ICONS: DesktopIconItem[] = [
  {
    id: 'd-arch',
    appId: 'architecture',
    name: 'Serverless Arch',
    icon: Layers,
    iconColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  },
  {
    id: 'd-term',
    appId: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'd-explorer',
    appId: 'explorer',
    name: 'File Explorer',
    icon: Folder,
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'd-proc',
    appId: 'processes',
    name: 'Task Manager',
    icon: Activity,
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    id: 'd-editor',
    appId: 'editor',
    name: 'README.md',
    icon: FileText,
    iconColor: 'text-slate-300 bg-slate-800/40 border-slate-700',
    props: { filePath: '/home/user/README.md' },
  },
  {
    id: 'd-settings',
    appId: 'settings',
    name: 'Settings',
    icon: Settings,
    iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    id: 'd-calc',
    appId: 'calc',
    name: 'Calculator',
    icon: Calculator,
    iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
];

export const Desktop: React.FC = () => {
  const { openApp, wallpaper, setStartMenuOpen } = useOS();
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleIconClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIconId(id);
    setContextMenu(null);
    setStartMenuOpen(false);
  };

  const handleIconDoubleClick = (e: React.MouseEvent, item: DesktopIconItem) => {
    e.stopPropagation();
    soundService.playClick();
    openApp(item.appId, item.props);
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setStartMenuOpen(false);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDesktopClick = () => {
    setSelectedIconId(null);
    setContextMenu(null);
    setStartMenuOpen(false);
  };

  const handleCreateNewFolder = () => {
    setContextMenu(null);
    try {
      vfsService.makeDir('/home/user/Desktop', `New Folder ${Math.floor(Math.random() * 100)}`);
      openApp('explorer', { initialPath: '/home/user/Desktop' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateNewFile = () => {
    setContextMenu(null);
    try {
      const name = `note-${Math.floor(Math.random() * 100)}.txt`;
      vfsService.touchFile('/home/user/Desktop', name, 'Note created from desktop.');
      openApp('editor', { filePath: `/home/user/Desktop/${name}` });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
      className="absolute inset-0 select-none overflow-hidden"
    >
      {/* Wallpaper Layer */}
      <div className="absolute inset-0 -z-10 bg-slate-950">
        {wallpaper === 'photo' && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={{
              backgroundImage: `url(/src/assets/images/os_desktop_wallpaper_1791094439680.jpg)`,
              filter: 'brightness(0.9) contrast(1.05)',
            }}
          >
            <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" />
          </div>
        )}
        {wallpaper === 'aurora' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-indigo-950/60 to-emerald-950/40" />
        )}
        {wallpaper === 'obsidian' && (
          <div className="absolute inset-0 bg-slate-950" />
        )}
      </div>

      {/* Desktop Grid of Icons */}
      <div className="p-4 grid grid-flow-col grid-rows-6 gap-3 w-fit">
        {DESKTOP_ICONS.map((item) => {
          const IconComp = item.icon;
          const isSelected = selectedIconId === item.id;
          return (
            <div
              key={item.id}
              onClick={(e) => handleIconClick(e, item.id)}
              onDoubleClick={(e) => handleIconDoubleClick(e, item)}
              className={`w-24 p-2 rounded flex flex-col items-center gap-1.5 cursor-pointer text-center transition-all ${
                isSelected
                  ? 'bg-sky-500/25 border border-sky-400/50 shadow-md backdrop-blur-sm'
                  : 'hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center border shadow-md transition-transform duration-100 ${
                  isSelected ? 'scale-105' : 'hover:scale-102'
                } ${item.iconColor}`}
              >
                <IconComp className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-medium leading-tight line-clamp-2 px-1 rounded drop-shadow-md text-white text-center ${
                  isSelected ? 'bg-sky-600/90' : ''
                }`}
              >
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="absolute z-50 w-48 rounded-lg bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-1 text-xs text-slate-200 animate-fadeIn"
        >
          <button
            onClick={handleCreateNewFolder}
            className="w-full px-2.5 py-1.5 rounded flex items-center gap-2 hover:bg-sky-600 hover:text-white transition-colors text-left"
          >
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>New Folder</span>
          </button>
          <button
            onClick={handleCreateNewFile}
            className="w-full px-2.5 py-1.5 rounded flex items-center gap-2 hover:bg-sky-600 hover:text-white transition-colors text-left"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>New Text Document</span>
          </button>
          <div className="h-px bg-slate-800 my-1" />
          <button
            onClick={() => {
              setContextMenu(null);
              openApp('terminal');
            }}
            className="w-full px-2.5 py-1.5 rounded flex items-center gap-2 hover:bg-sky-600 hover:text-white transition-colors text-left"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Terminal</span>
          </button>
          <button
            onClick={() => {
              setContextMenu(null);
              openApp('architecture');
            }}
            className="w-full px-2.5 py-1.5 rounded flex items-center gap-2 hover:bg-sky-600 hover:text-white transition-colors text-left"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Serverless Architecture</span>
          </button>
          <button
            onClick={() => {
              setContextMenu(null);
              openApp('settings');
            }}
            className="w-full px-2.5 py-1.5 rounded flex items-center gap-2 hover:bg-sky-600 hover:text-white transition-colors text-left"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};
