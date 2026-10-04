export interface VFSNode {
  id: string;
  parentId: string | null;
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  mimeType: string;
  content?: string;
  permissions: string;
  owner: string;
  updatedAt: string;
}

export interface ProcessItem {
  id: string;
  pid: number;
  command: string;
  args: string;
  cwd: string;
  status: 'running' | 'sleeping' | 'stopped';
  cpuPercent: string;
  memoryMb: number;
  owner: string;
  startedAt: string;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  prevBounds?: {
    position: { x: number; y: number };
    size: { width: number; height: number };
  };
  props?: Record<string, any>;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'system' | 'utilities' | 'development' | 'accessories';
  defaultSize: { width: number; height: number };
  singleton?: boolean;
}

export interface RealtimeMessage {
  id: string;
  channel: string;
  event: string;
  payload: any;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export interface DesktopIcon {
  id: string;
  appId: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  customAction?: () => void;
}
