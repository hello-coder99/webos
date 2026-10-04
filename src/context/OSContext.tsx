import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WindowState, AppDefinition, SystemNotification, RealtimeMessage } from '../types/os';
import { processService } from '../services/processService';
import { realtimeService } from '../services/realtimeService';
import { soundService } from '../services/soundService';

interface OSContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  openApp: (appId: string, props?: Record<string, any>, title?: string) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowBounds: (
    id: string,
    position?: { x: number; y: number },
    size?: { width: number; height: number }
  ) => void;
  isStartMenuOpen: boolean;
  setStartMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  notifications: SystemNotification[];
  dismissNotification: (id: string) => void;
  realtimeEvents: RealtimeMessage[];
  wallpaper: string;
  setWallpaper: (wp: string) => void;
  systemMetrics: {
    totalProcesses: number;
    runningCount: number;
    totalMemoryMb: number;
    totalCpuPercent: string;
  };
}

const OSContext = createContext<OSContextType | undefined>(undefined);

const APP_META: Record<string, { title: string; icon: string; defaultSize: { width: number; height: number }; singleton?: boolean }> = {
  terminal: {
    title: 'Terminal',
    icon: 'Terminal',
    defaultSize: { width: 680, height: 440 },
  },
  explorer: {
    title: 'File Explorer',
    icon: 'Folder',
    defaultSize: { width: 760, height: 480 },
  },
  editor: {
    title: 'Text Editor',
    icon: 'FileText',
    defaultSize: { width: 640, height: 500 },
  },
  processes: {
    title: 'Task Manager',
    icon: 'Activity',
    defaultSize: { width: 700, height: 450 },
    singleton: true,
  },
  architecture: {
    title: 'Serverless Architecture',
    icon: 'Layers',
    defaultSize: { width: 780, height: 520 },
    singleton: true,
  },
  settings: {
    title: 'Settings',
    icon: 'Settings',
    defaultSize: { width: 560, height: 420 },
    singleton: true,
  },
  calc: {
    title: 'Calculator',
    icon: 'Calculator',
    defaultSize: { width: 320, height: 420 },
  },
};

export const OSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [isStartMenuOpen, setStartMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'welcome-notif',
      title: 'AetherOS Initialized',
      message: 'Serverless POSIX VFS & Realtime IPC connected.',
      type: 'success',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeMessage[]>([]);
  const [wallpaper, setWallpaper] = useState<string>('photo'); // 'photo' | 'obsidian' | 'aurora'
  const [systemMetrics, setSystemMetrics] = useState(processService.getSummary());

  // Listen for realtime events
  useEffect(() => {
    const unsub = realtimeService.subscribe('*', (payload, msg) => {
      setRealtimeEvents((prev) => [msg, ...prev].slice(0, 50));

      if (msg.event === 'notification:new') {
        setNotifications((prev) => [payload as SystemNotification, ...prev].slice(0, 10));
      }

      if (msg.channel === 'aether-process') {
        setSystemMetrics(processService.getSummary());
      }
    });

    return () => unsub();
  }, []);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setMaxZIndex((prev) => {
      const nextZ = prev + 1;
      setWindows((curr) =>
        curr.map((w) =>
          w.id === id
            ? { ...w, zIndex: nextZ, isMinimized: false }
            : w
        )
      );
      return nextZ;
    });
  }, []);

  const openApp = useCallback(
    (appId: string, initialProps?: Record<string, any>, customTitle?: string) => {
      soundService.playWindowOpen();
      const meta = APP_META[appId] || {
        title: appId,
        icon: 'Square',
        defaultSize: { width: 600, height: 400 },
      };

      // Check if singleton already open
      if (meta.singleton) {
        const existing = windows.find((w) => w.appId === appId);
        if (existing) {
          if (existing.isMinimized) {
            setWindows((prev) =>
              prev.map((w) => (w.id === existing.id ? { ...w, isMinimized: false } : w))
            );
          }
          focusWindow(existing.id);
          return existing.id;
        }
      }

      const nextZ = maxZIndex + 1;
      setMaxZIndex(nextZ);

      // Stagger position slightly based on existing windows
      const offset = (windows.length % 6) * 28 + 60;
      const initialPos = {
        x: Math.min(window.innerWidth - meta.defaultSize.width - 20, Math.max(40, offset)),
        y: Math.min(window.innerHeight - meta.defaultSize.height - 60, Math.max(40, offset)),
      };

      const newId = `win-${appId}-${Math.random().toString(36).substring(2, 7)}`;
      const newWin: WindowState = {
        id: newId,
        appId,
        title: customTitle || meta.title,
        icon: meta.icon,
        isMinimized: false,
        isMaximized: false,
        zIndex: nextZ,
        position: initialPos,
        size: meta.defaultSize,
        props: initialProps,
      };

      setWindows((prev) => [...prev, newWin]);
      setActiveWindowId(newId);

      // Broadcast window open via IPC
      realtimeService.broadcast('aether-taskbar', 'window:opened', {
        id: newId,
        appId,
        title: newWin.title,
      });

      return newId;
    },
    [windows, maxZIndex, focusWindow]
  );

  const closeWindow = useCallback(
    (id: string) => {
      soundService.playClick();
      setWindows((prev) => {
        const target = prev.find((w) => w.id === id);
        const filtered = prev.filter((w) => w.id !== id);
        if (target) {
          realtimeService.broadcast('aether-taskbar', 'window:closed', { id, appId: target.appId });
        }
        return filtered;
      });

      setActiveWindowId((prevActive) => {
        if (prevActive === id) {
          const remaining = windows.filter((w) => w.id !== id && !w.isMinimized);
          if (remaining.length > 0) {
            // Find one with highest z-index
            const nextFocus = remaining.reduce((prev, curr) =>
              curr.zIndex > prev.zIndex ? curr : prev
            );
            return nextFocus.id;
          }
          return null;
        }
        return prevActive;
      });
    },
    [windows]
  );

  const minimizeWindow = useCallback((id: string) => {
    soundService.playClick();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((prevActive) => (prevActive === id ? null : prevActive));
    realtimeService.broadcast('aether-taskbar', 'window:minimized', { id });
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    soundService.playClick();
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.isMaximized) {
          // Restore
          return {
            ...w,
            isMaximized: false,
            position: w.prevBounds?.position || { x: 80, y: 80 },
            size: w.prevBounds?.size || { width: 680, height: 440 },
          };
        } else {
          // Maximize to viewport minus taskbar (height 48px)
          return {
            ...w,
            isMaximized: true,
            prevBounds: {
              position: { ...w.position },
              size: { ...w.size },
            },
            position: { x: 0, y: 0 },
            size: {
              width: window.innerWidth,
              height: window.innerHeight - 48,
            },
          };
        }
      })
    );
  }, []);

  const updateWindowBounds = useCallback(
    (
      id: string,
      position?: { x: number; y: number },
      size?: { width: number; height: number }
    ) => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          return {
            ...w,
            position: position ? { ...position } : w.position,
            size: size ? { ...size } : w.size,
          };
        })
      );
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Launch initial apps on first mount
  useEffect(() => {
    // Open Architecture Inspector & Terminal initially to showcase the full stack immediately
    const termId = openApp('terminal');
    const archId = openApp('architecture');
    focusWindow(archId);
  }, []);

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        openApp,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowBounds,
        isStartMenuOpen,
        setStartMenuOpen,
        notifications,
        dismissNotification,
        realtimeEvents,
        wallpaper,
        setWallpaper,
        systemMetrics,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
