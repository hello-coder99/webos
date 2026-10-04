import { ProcessItem } from '../types/os';
import { realtimeService } from './realtimeService';

const INITIAL_PROCESSES: ProcessItem[] = [
  {
    id: 'proc-1',
    pid: 1,
    command: 'init',
    args: '--serverless --system',
    cwd: '/',
    status: 'running',
    cpuPercent: '0.1%',
    memoryMb: 16,
    owner: 'root',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'proc-2',
    pid: 2,
    command: 'vfs-indexer',
    args: '--watch=/home --storage=postgres',
    cwd: '/sys',
    status: 'running',
    cpuPercent: '0.3%',
    memoryMb: 28,
    owner: 'system',
    startedAt: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: 'proc-3',
    pid: 3,
    command: 'realtime-broker',
    args: '--provider=pusher-client',
    cwd: '/var/run',
    status: 'running',
    cpuPercent: '0.2%',
    memoryMb: 22,
    owner: 'system',
    startedAt: new Date(Date.now() - 3400000).toISOString(),
  },
  {
    id: 'proc-4',
    pid: 4,
    command: 'window-compositor',
    args: '--display=:0 --z-stacking',
    cwd: '/home/user',
    status: 'running',
    cpuPercent: '1.4%',
    memoryMb: 48,
    owner: 'user',
    startedAt: new Date(Date.now() - 3300000).toISOString(),
  },
  {
    id: 'proc-5',
    pid: 5,
    command: 'cron-sync-worker',
    args: '--interval=60s --cloud=neon-db',
    cwd: '/etc/cron.d',
    status: 'sleeping',
    cpuPercent: '0.0%',
    memoryMb: 12,
    owner: 'system',
    startedAt: new Date(Date.now() - 3000000).toISOString(),
  },
];

class ProcessService {
  private processes: ProcessItem[] = [...INITIAL_PROCESSES];
  private nextPid = 100;
  private intervalId: number | null = null;

  constructor() {
    this.startSimulationTick();
  }

  private startSimulationTick() {
    if (typeof window === 'undefined') return;

    // Periodically simulate subtle CPU/Memory fluctuation (as if reported by Upstash Redis cache)
    this.intervalId = window.setInterval(() => {
      let changed = false;
      this.processes = this.processes.map((proc) => {
        if (proc.status === 'running') {
          // slight random jitter
          const baseCpu = parseFloat(proc.cpuPercent.replace('%', ''));
          const delta = (Math.random() - 0.5) * 0.4;
          const newCpu = Math.max(0.0, Math.min(25.0, baseCpu + delta)).toFixed(1);
          if (newCpu !== proc.cpuPercent) {
            changed = true;
            return {
              ...proc,
              cpuPercent: `${newCpu}%`,
            };
          }
        }
        return proc;
      });

      if (changed) {
        realtimeService.broadcast('aether-process', 'process:metrics_tick', {
          count: this.processes.length,
          timestamp: new Date().toISOString(),
        });
      }
    }, 4000);
  }

  public getProcesses(): ProcessItem[] {
    return [...this.processes];
  }

  public spawn(command: string, args = '', cwd = '/home/user'): ProcessItem {
    const pid = this.nextPid++;
    const newProc: ProcessItem = {
      id: `proc-${Math.random().toString(36).substring(2, 9)}`,
      pid,
      command,
      args,
      cwd,
      status: 'running',
      cpuPercent: `${(Math.random() * 2.5 + 0.2).toFixed(1)}%`,
      memoryMb: Math.floor(Math.random() * 30 + 15),
      owner: 'user',
      startedAt: new Date().toISOString(),
    };

    this.processes.push(newProc);

    realtimeService.broadcast('aether-process', 'process:spawned', newProc);
    realtimeService.notifySystem({
      title: 'Process Started',
      message: `PID ${newProc.pid} (${newProc.command}) spawned`,
      type: 'info',
    });

    return newProc;
  }

  public kill(pid: number): boolean {
    const index = this.processes.findIndex((p) => p.pid === pid);
    if (index === -1) return false;

    const target = this.processes[index];
    if (target.pid <= 3) {
      realtimeService.notifySystem({
        title: 'Permission Denied',
        message: `Cannot terminate critical system daemon PID ${pid}`,
        type: 'error',
      });
      return false;
    }

    this.processes.splice(index, 1);
    realtimeService.broadcast('aether-process', 'process:killed', { pid, command: target.command });
    realtimeService.notifySystem({
      title: 'Process Terminated',
      message: `PID ${pid} (${target.command}) was killed`,
      type: 'warning',
    });

    return true;
  }

  public getSummary() {
    const runningCount = this.processes.filter((p) => p.status === 'running').length;
    const totalMemory = this.processes.reduce((acc, p) => acc + p.memoryMb, 0);
    const avgCpu = (
      this.processes.reduce((acc, p) => acc + parseFloat(p.cpuPercent.replace('%', '')), 0)
    ).toFixed(1);

    return {
      totalProcesses: this.processes.length,
      runningCount,
      totalMemoryMb: totalMemory,
      totalCpuPercent: `${avgCpu}%`,
    };
  }
}

export const processService = new ProcessService();
