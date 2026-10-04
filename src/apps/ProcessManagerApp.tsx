import React, { useState, useEffect } from 'react';
import { Activity, Play, XCircle, Search, Server, Cpu, Database, RefreshCw } from 'lucide-react';
import { ProcessItem } from '../types/os';
import { processService } from '../services/processService';
import { realtimeService } from '../services/realtimeService';

export const ProcessManagerApp: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSpawning, setIsSpawning] = useState(false);
  const [newCommand, setNewCommand] = useState('data-worker');
  const [newArgs, setNewArgs] = useState('--batch-size=500');

  const refreshProcesses = () => {
    setProcesses(processService.getProcesses());
  };

  useEffect(() => {
    refreshProcesses();
    const unsub = realtimeService.subscribe('aether-process:*', () => {
      refreshProcesses();
    });
    return () => unsub();
  }, []);

  const handleKill = (pid: number) => {
    processService.kill(pid);
    refreshProcesses();
  };

  const handleSpawn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommand.trim()) return;
    processService.spawn(newCommand.trim(), newArgs.trim());
    setIsSpawning(false);
    refreshProcesses();
  };

  const summary = processService.getSummary();

  const filtered = processes.filter(
    (p) =>
      p.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.args.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.pid).includes(searchQuery)
  );

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 text-xs">
      {/* Metrics Banner */}
      <div className="p-3 bg-slate-900/80 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Running Tasks</div>
            <div className="text-base font-bold text-slate-100 font-mono tabular-nums">
              {summary.runningCount} / {summary.totalProcesses}
            </div>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Total CPU Load</div>
            <div className="text-base font-bold text-slate-100 font-mono tabular-nums">
              {summary.totalCpuPercent}
            </div>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Memory Allocated</div>
            <div className="text-base font-bold text-slate-100 font-mono tabular-nums">
              {summary.totalMemoryMb} MB
            </div>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">State Cache</div>
            <div className="text-xs font-semibold text-purple-300 truncate">Upstash Redis</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-10 px-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSpawning(true)}
            className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Spawn Process</span>
          </button>
          {selectedPid !== null && (
            <button
              onClick={() => handleKill(selectedPid)}
              disabled={selectedPid <= 3}
              className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-600 disabled:opacity-40 text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Kill PID {selectedPid}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-44">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Filter processes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1 text-xs text-slate-200 outline-none focus:border-sky-500"
            />
          </div>
          <button
            onClick={refreshProcesses}
            title="Refresh"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spawn Modal */}
      {isSpawning && (
        <form
          onSubmit={handleSpawn}
          className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2 shrink-0 animate-fadeIn"
        >
          <span className="text-slate-400">Command:</span>
          <input
            type="text"
            value={newCommand}
            onChange={(e) => setNewCommand(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-100 outline-none w-36"
            placeholder="worker"
          />
          <span className="text-slate-400">Arguments:</span>
          <input
            type="text"
            value={newArgs}
            onChange={(e) => setNewArgs(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-100 outline-none flex-1"
            placeholder="--daemon"
          />
          <button
            type="submit"
            className="px-3 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            Launch
          </button>
          <button
            type="button"
            onClick={() => setIsSpawning(false)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Process Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-medium z-10">
            <tr>
              <th className="py-2 pl-3">PID</th>
              <th className="py-2">Command</th>
              <th className="py-2">Arguments</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">CPU</th>
              <th className="py-2 text-right">Memory</th>
              <th className="py-2 pr-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {filtered.map((proc) => {
              const isSelected = selectedPid === proc.pid;
              return (
                <tr
                  key={proc.id}
                  onClick={() => setSelectedPid(proc.pid)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-sky-500/20 text-white' : 'hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <td className="py-2 pl-3 font-mono tabular-nums font-semibold text-sky-400">
                    {proc.pid}
                  </td>
                  <td className="py-2 font-medium">{proc.command}</td>
                  <td className="py-2 font-mono text-[11px] text-slate-500 truncate max-w-[200px]">
                    {proc.args || '-'}
                  </td>
                  <td className="py-2">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        proc.status === 'running'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {proc.status}
                    </span>
                  </td>
                  <td className="py-2 font-mono tabular-nums text-right text-slate-300">
                    {proc.cpuPercent}
                  </td>
                  <td className="py-2 font-mono tabular-nums text-right text-slate-400">
                    {proc.memoryMb} MB
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {proc.pid > 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleKill(proc.pid);
                        }}
                        className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-900/60 text-[10px]"
                      >
                        Kill
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="h-6 px-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span>Upstash Redis Session IPC Active</span>
        <span>Realtime updates every 4s</span>
      </div>
    </div>
  );
};
