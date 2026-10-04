import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  ArrowLeft,
  ArrowUp,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Grid,
  List as ListIcon,
  HardDrive,
  Home,
  Monitor,
  FolderOpen,
} from 'lucide-react';
import { VFSNode } from '../types/os';
import { vfsService } from '../services/vfsService';
import { useOS } from '../context/OSContext';
import { realtimeService } from '../services/realtimeService';

export const FileExplorerApp: React.FC<{ initialPath?: string }> = ({ initialPath = '/home/user' }) => {
  const { openApp } = useOS();
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);
  const [items, setItems] = useState<VFSNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreatingDir, setIsCreatingDir] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');

  const loadDirectory = (path: string) => {
    try {
      const children = vfsService.listDir(path);
      setItems(children);
      setSelectedPath(null);
    } catch {
      // If path invalid, go to /home/user
      try {
        const fallback = vfsService.listDir('/home/user');
        setCurrentPath('/home/user');
        setItems(fallback);
      } catch {
        setItems([]);
      }
    }
  };

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  // Listen to realtime VFS updates
  useEffect(() => {
    const unsub = realtimeService.subscribe('aether-vfs:*', () => {
      loadDirectory(currentPath);
    });
    return () => unsub();
  }, [currentPath]);

  const navigateTo = (path: string) => {
    const clean = vfsService.normalizePath(path);
    if (clean === currentPath) return;

    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(clean);
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
    setCurrentPath(clean);
  };

  const handleBack = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setCurrentPath(history[historyIdx - 1]);
    }
  };

  const handleUp = () => {
    if (currentPath === '/') return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    navigateTo(parent);
  };

  const handleItemDoubleClick = (item: VFSNode) => {
    if (item.isDirectory) {
      navigateTo(item.path);
    } else {
      openApp('editor', { filePath: item.path }, `Text Editor - ${item.name}`);
    }
  };

  const handleCreateDir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameInput.trim()) return;
    try {
      vfsService.makeDir(currentPath, newNameInput.trim());
      setIsCreatingDir(false);
      setNewNameInput('');
      loadDirectory(currentPath);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameInput.trim()) return;
    try {
      vfsService.touchFile(currentPath, newNameInput.trim(), '');
      setIsCreatingFile(false);
      setNewNameInput('');
      loadDirectory(currentPath);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedPath) return;
    try {
      vfsService.removeNode(selectedPath);
      loadDirectory(currentPath);
      setSelectedPath(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedNode = items.find((i) => i.path === selectedPath);

  const getFileIcon = (item: VFSNode) => {
    if (item.isDirectory) {
      return <Folder className="w-8 h-8 text-amber-400 fill-amber-400/20" />;
    }
    const ext = item.name.split('.').pop()?.toLowerCase();
    if (ext === 'conf' || ext === 'json' || ext === 'sh' || ext === 'py') {
      return <FileCode className="w-8 h-8 text-sky-400" />;
    }
    return <FileText className="w-8 h-8 text-slate-300" />;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 text-xs">
      {/* Top Navigation & Toolbar */}
      <div className="h-10 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 shrink-0">
        <button
          onClick={handleBack}
          disabled={historyIdx <= 0}
          title="Back"
          className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleUp}
          disabled={currentPath === '/'}
          title="Up one level"
          className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Breadcrumb Path input */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1 font-mono text-xs text-slate-300 overflow-x-auto">
          <HardDrive className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{currentPath}</span>
        </div>

        {/* Search */}
        <div className="relative w-36">
          <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-sky-500"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center border border-slate-800 rounded overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 ${viewMode === 'grid' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:bg-slate-850'}`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 ${viewMode === 'list' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:bg-slate-850'}`}
          >
            <ListIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Subbar */}
      <div className="h-8 px-3 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsCreatingDir(true);
              setIsCreatingFile(false);
              setNewNameInput('');
            }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-[11px] transition-colors"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => {
              setIsCreatingFile(true);
              setIsCreatingDir(false);
              setNewNameInput('');
            }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-[11px] transition-colors"
          >
            <Plus className="w-3 h-3 text-sky-400" />
            <span>New File</span>
          </button>
        </div>

        {selectedPath && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteSelected}
              className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-900/60 hover:bg-rose-900 text-rose-300 flex items-center gap-1 text-[11px] transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal / Inline form for creating item */}
      {(isCreatingDir || isCreatingFile) && (
        <form
          onSubmit={isCreatingDir ? handleCreateDir : handleCreateFile}
          className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2 shrink-0 animate-fadeIn"
        >
          <span className="text-xs text-slate-400">
            {isCreatingDir ? 'Folder Name:' : 'File Name:'}
          </span>
          <input
            type="text"
            value={newNameInput}
            onChange={(e) => setNewNameInput(e.target.value)}
            placeholder={isCreatingDir ? 'my-folder' : 'notes.txt'}
            autoFocus
            className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreatingDir(false);
              setIsCreatingFile(false);
            }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Body Area with Sidebar and Content Viewport */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar Shortcuts */}
        <div className="w-44 bg-slate-900/40 border-r border-slate-800/80 p-2 space-y-1 shrink-0 overflow-y-auto">
          <div className="text-[10px] font-semibold tracking-wider text-slate-500 px-2 py-1 uppercase">
            Quick Locations
          </div>
          <button
            onClick={() => navigateTo('/home/user')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
              currentPath === '/home/user' ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Home</span>
          </button>
          <button
            onClick={() => navigateTo('/home/user/Desktop')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
              currentPath === '/home/user/Desktop' ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Desktop</span>
          </button>
          <button
            onClick={() => navigateTo('/home/user/Documents')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
              currentPath === '/home/user/Documents' ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Documents</span>
          </button>
          <button
            onClick={() => navigateTo('/')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
              currentPath === '/' ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Root (/)</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-3 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Folder className="w-10 h-10 opacity-40" />
              <p>This folder is empty</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredItems.map((item) => {
                const isSelected = selectedPath === item.path;
                return (
                  <div
                    key={item.path}
                    onClick={() => setSelectedPath(item.path)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`flex flex-col items-center p-2 rounded cursor-pointer border text-center transition-all ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-500/50 text-white'
                        : 'border-transparent hover:bg-slate-800/50 hover:border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="mb-1">{getFileIcon(item)}</div>
                    <span className="text-xs truncate w-full px-1">{item.name}</span>
                    <span className="text-[10px] text-slate-500 tabular-nums">
                      {item.isDirectory ? 'folder' : `${item.size} B`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-medium">
                  <th className="pb-1.5 pl-2">Name</th>
                  <th className="pb-1.5">Type</th>
                  <th className="pb-1.5">Size</th>
                  <th className="pb-1.5">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {filteredItems.map((item) => {
                  const isSelected = selectedPath === item.path;
                  return (
                    <tr
                      key={item.path}
                      onClick={() => setSelectedPath(item.path)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-500/20 text-white' : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <td className="py-2 pl-2 flex items-center gap-2">
                        {item.isDirectory ? (
                          <Folder className="w-4 h-4 text-amber-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-medium truncate">{item.name}</span>
                      </td>
                      <td className="py-2 text-slate-500">{item.mimeType}</td>
                      <td className="py-2 font-mono tabular-nums text-slate-400">
                        {item.isDirectory ? '-' : `${item.size} B`}
                      </td>
                      <td className="py-2 font-mono text-slate-500">{item.permissions}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 px-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <div className="flex items-center gap-3">
          <span>{items.length} items</span>
          {selectedNode && (
            <span>
              Selected: <strong className="text-slate-300">{selectedNode.name}</strong> ({selectedNode.permissions})
            </span>
          )}
        </div>
        <div>
          <span>Provider: Postgres Relational VFS</span>
        </div>
      </div>
    </div>
  );
};
