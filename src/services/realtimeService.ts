import { RealtimeMessage, SystemNotification } from '../types/os';

type EventCallback = (payload: any, message: RealtimeMessage) => void;

class RealtimeService {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private messageHistory: RealtimeMessage[] = [];
  private providerName: 'Pusher / Supabase Realtime (Serverless)' = 'Pusher / Supabase Realtime (Serverless)';

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('aether_os_ipc_bus');
      this.broadcastChannel.onmessage = (event) => {
        const msg = event.data as RealtimeMessage;
        this.dispatchLocal(msg);
      };
    }
  }

  public getProvider(): string {
    return this.providerName;
  }

  public getHistory(): RealtimeMessage[] {
    return [...this.messageHistory];
  }

  public subscribe(channelAndEvent: string, callback: EventCallback): () => void {
    if (!this.listeners.has(channelAndEvent)) {
      this.listeners.set(channelAndEvent, new Set());
    }
    this.listeners.get(channelAndEvent)!.add(callback);

    return () => {
      this.listeners.get(channelAndEvent)?.delete(callback);
    };
  }

  public broadcast(channel: string, event: string, payload: any): void {
    const message: RealtimeMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      channel,
      event,
      payload,
      timestamp: new Date().toISOString(),
    };

    // Store in ephemeral history (up to 100 messages)
    this.messageHistory.unshift(message);
    if (this.messageHistory.length > 100) {
      this.messageHistory.pop();
    }

    // Broadcast through IPC channel (simulating Pusher / Supabase Realtime publish)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (e) {
        console.warn('BroadcastChannel post error', e);
      }
    }

    // Also dispatch to current tab listeners
    this.dispatchLocal(message);
  }

  private dispatchLocal(message: RealtimeMessage) {
    const specificKey = `${message.channel}:${message.event}`;
    const channelWildcard = `${message.channel}:*`;
    const globalWildcard = '*';

    const notify = (key: string) => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.forEach((cb) => {
          try {
            cb(message.payload, message);
          } catch (err) {
            console.error('Error in realtime listener for', key, err);
          }
        });
      }
    };

    notify(specificKey);
    notify(channelWildcard);
    notify(globalWildcard);
  }

  public notifySystem(notification: Omit<SystemNotification, 'id' | 'timestamp'>) {
    const fullNotification: SystemNotification = {
      ...notification,
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.broadcast('aether-system', 'notification:new', fullNotification);
    return fullNotification;
  }
}

export const realtimeService = new RealtimeService();
