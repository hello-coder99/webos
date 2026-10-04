import React, { useState, useEffect } from 'react';
import { OSProvider, useOS } from './context/OSContext';
import { Desktop } from './components/desktop/Desktop';
import { WindowManager } from './components/window/WindowManager';
import { Taskbar } from './components/taskbar/Taskbar';
import { StartMenu } from './components/startmenu/StartMenu';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';

const OSDesktop: React.FC = () => {
  const { setStartMenuOpen, notifications } = useOS();
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Global hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStartMenuOpen(false);
        setIsNotifDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setStartMenuOpen]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans antialiased select-none">
      {/* 1. Desktop surface: wallpaper, icons, context menu */}
      <Desktop />

      {/* 2. Window Manager: floating, resizable, draggable DOM windows */}
      <WindowManager />

      {/* 3. Start Menu popout */}
      <StartMenu />

      {/* 4. Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />

      {/* 5. Bottom Taskbar: Start button, active apps, system tray */}
      <div className="absolute bottom-0 left-0 right-0">
        <Taskbar
          onToggleNotifications={() => setIsNotifDrawerOpen((prev) => !prev)}
          unreadNotifs={notifications.length}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <OSProvider>
      <OSDesktop />
    </OSProvider>
  );
}
