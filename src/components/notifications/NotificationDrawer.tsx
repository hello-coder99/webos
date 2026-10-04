import React from 'react';
import { X, Bell, Info, CheckCircle2, AlertTriangle, AlertCircle, Send } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { realtimeService } from '../../services/realtimeService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, dismissNotification } = useOS();

  if (!isOpen) return null;

  const handleTestBroadcast = () => {
    realtimeService.notifySystem({
      title: 'Pusher IPC Ping',
      message: `Stateless event emitted at ${new Date().toLocaleTimeString()}`,
      type: 'info',
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 right-3 z-50 w-80 max-h-96 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-xs text-slate-200 animate-fadeIn"
    >
      {/* Header */}
      <div className="h-10 px-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-xs text-slate-100">Notifications</span>
          <span className="px-1.5 py-0.2 bg-slate-800 rounded text-[10px] text-slate-400 font-mono">
            {notifications.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleTestBroadcast}
            title="Emit test IPC notification"
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-sky-300 text-[11px] flex items-center gap-1 transition-colors"
          >
            <Send className="w-2.5 h-2.5" />
            <span>Test IPC</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 p-2 overflow-y-auto space-y-2">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No active notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 group relative"
            >
              <div className="shrink-0 mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="font-semibold text-slate-200 truncate">{n.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed break-words">
                  {n.message}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{n.timestamp}</div>
              </div>
              <button
                onClick={() => dismissNotification(n.id)}
                className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-300 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
