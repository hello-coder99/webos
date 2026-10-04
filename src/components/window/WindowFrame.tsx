import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Minus, Square, Copy, X, Terminal, Folder, FileText, Activity, Layers, Settings, Calculator } from 'lucide-react';
import { WindowState } from '../../types/os';
import { useOS } from '../../context/OSContext';

interface WindowFrameProps {
  win: WindowState;
  children: ReactNode;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal,
  Folder,
  FileText,
  Activity,
  Layers,
  Settings,
  Calculator,
};

export const WindowFrame: React.FC<WindowFrameProps> = ({ win, children }) => {
  const { activeWindowId, focusWindow, closeWindow, minimizeWindow, maximizeWindow, updateWindowBounds } = useOS();
  const isFocused = activeWindowId === win.id;

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingDir, setResizingDir] = useState<string | null>(null);
  const resizeStart = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; startW: number; startH: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
  });

  const IconComponent = ICON_MAP[win.icon] || Square;

  // Dragging logic
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    if ((e.target as HTMLElement).closest('button')) return;

    focusWindow(win.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - win.position.x,
      y: e.clientY - win.position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const nextX = Math.max(-win.size.width + 100, Math.min(window.innerWidth - 80, e.clientX - dragOffset.x));
        const nextY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
        updateWindowBounds(win.id, { x: nextX, y: nextY });
      } else if (resizingDir) {
        const dx = e.clientX - resizeStart.current.mouseX;
        const dy = e.clientY - resizeStart.current.mouseY;
        let newW = resizeStart.current.startW;
        let newH = resizeStart.current.startH;
        let newX = resizeStart.current.startX;
        let newY = resizeStart.current.startY;

        const MIN_W = 280;
        const MIN_H = 180;

        if (resizingDir.includes('e')) {
          newW = Math.max(MIN_W, resizeStart.current.startW + dx);
        }
        if (resizingDir.includes('s')) {
          newH = Math.max(MIN_H, resizeStart.current.startH + dy);
        }
        if (resizingDir.includes('w')) {
          const possibleW = resizeStart.current.startW - dx;
          if (possibleW >= MIN_W) {
            newW = possibleW;
            newX = resizeStart.current.startX + dx;
          }
        }
        if (resizingDir.includes('n')) {
          const possibleH = resizeStart.current.startH - dy;
          if (possibleH >= MIN_H) {
            newH = possibleH;
            newY = resizeStart.current.startY + dy;
          }
        }

        updateWindowBounds(win.id, { x: newX, y: newY }, { width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizingDir(null);
    };

    if (isDragging || resizingDir) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, resizingDir, dragOffset, win.id, win.size.width, updateWindowBounds]);

  const startResize = (dir: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (win.isMaximized) return;

    focusWindow(win.id);
    setResizingDir(dir);
    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: win.position.x,
      startY: win.position.y,
      startW: win.size.width,
      startH: win.size.height,
    };
  };

  if (win.isMinimized) {
    return null;
  }

  return (
    <div
      onMouseDown={() => focusWindow(win.id)}
      style={{
        position: 'absolute',
        left: `${win.position.x}px`,
        top: `${win.position.y}px`,
        width: `${win.size.width}px`,
        height: `${win.size.height}px`,
        zIndex: win.zIndex,
      }}
      className={`flex flex-col rounded-lg overflow-hidden select-none transition-shadow duration-150 ${
        isFocused
          ? 'shadow-2xl shadow-black/60 ring-1 ring-sky-500/40 bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl'
          : 'shadow-lg shadow-black/40 border border-slate-800 bg-slate-950/90 backdrop-blur-md opacity-95'
      }`}
    >
      {/* Titlebar Header */}
      <div
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={() => maximizeWindow(win.id)}
        className={`h-9 px-3 flex items-center justify-between border-b cursor-move shrink-0 ${
          isFocused
            ? 'bg-slate-800/90 border-slate-700/70 text-slate-100'
            : 'bg-slate-900/70 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 mr-2">
          <IconComponent className={`w-4 h-4 shrink-0 ${isFocused ? 'text-sky-400' : 'text-slate-500'}`} />
          <span className="text-xs font-semibold tracking-wide truncate max-w-[340px]">
            {win.title}
          </span>
        </div>

        {/* Window action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => minimizeWindow(win.id)}
            title="Minimize"
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700/70 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => maximizeWindow(win.id)}
            title={win.isMaximized ? 'Restore' : 'Maximize'}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700/70 text-slate-400 hover:text-slate-100 transition-colors"
          >
            {win.isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
          </button>
          <button
            onClick={() => closeWindow(win.id)}
            title="Close"
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 min-h-0 overflow-auto relative bg-slate-950/80 text-slate-100 select-text">
        {children}
      </div>

      {/* 8-Way Resize Handles (hidden when maximized) */}
      {!win.isMaximized && (
        <>
          <div onMouseDown={(e) => startResize('n', e)} className="absolute top-0 left-2 right-2 h-1 cursor-n-resize" />
          <div onMouseDown={(e) => startResize('s', e)} className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize" />
          <div onMouseDown={(e) => startResize('w', e)} className="absolute top-2 bottom-2 left-0 w-1 cursor-w-resize" />
          <div onMouseDown={(e) => startResize('e', e)} className="absolute top-2 bottom-2 right-0 w-1 cursor-e-resize" />
          <div onMouseDown={(e) => startResize('nw', e)} className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" />
          <div onMouseDown={(e) => startResize('ne', e)} className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" />
          <div onMouseDown={(e) => startResize('sw', e)} className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" />
          <div onMouseDown={(e) => startResize('se', e)} className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" />
        </>
      )}
    </div>
  );
};
