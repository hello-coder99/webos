import React, { useState, useRef, useEffect } from 'react';
import { vfsService } from '../services/vfsService';
import { processService } from '../services/processService';
import { soundService } from '../services/soundService';

interface OutputLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
}

export const TerminalApp: React.FC = () => {
  const [currentDir, setCurrentDir] = useState<string>('/home/user');
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [lines, setLines] = useState<OutputLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'AetherOS Serverless Shell v1.0.0 (x86_64-vercel-serverless)',
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Connected to Cloud Postgres VFS. Type "help" or "neofetch" to begin.',
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = (type: OutputLine['type'], text: string) => {
    setLines((prev) => [...prev, { id: Math.random().toString(), type, text }]);
  };

  const executeCommand = (rawCommand: string) => {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;

    addLine('input', `${currentDir} $ ${trimmed}`);
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        addLine(
          'output',
          `Available commands:
  ls [-l] [path]        List directory contents
  cd <path>             Change working directory
  pwd                   Print working directory
  cat <file>            Print file contents
  touch <file> [text]   Create new file
  mkdir <dir>           Create new directory
  rm <path>             Remove file or directory
  echo <text>           Display line of text
  ps                    List active serverless processes
  kill <pid>            Terminate process
  top                   Show system load and memory
  neofetch              Display OS and hardware summary
  clear                 Clear terminal screen
  whoami                Show current user
  date                  Display current system time`
        );
        break;

      case 'clear':
        setLines([]);
        break;

      case 'pwd':
        addLine('output', currentDir);
        break;

      case 'whoami':
        addLine('output', 'user (uid=1000 gid=1000 groups=1000(user),27(sudo))');
        break;

      case 'date':
        addLine('output', new Date().toUTCString());
        break;

      case 'echo':
        addLine('output', args.join(' '));
        break;

      case 'cd': {
        const target = args[0] || '/home/user';
        let resolved = target;
        if (!target.startsWith('/')) {
          if (target === '..') {
            resolved = currentDir.substring(0, currentDir.lastIndexOf('/')) || '/';
          } else if (target === '.') {
            resolved = currentDir;
          } else {
            resolved = currentDir === '/' ? `/${target}` : `${currentDir}/${target}`;
          }
        }
        resolved = vfsService.normalizePath(resolved);
        const node = vfsService.getNode(resolved);
        if (!node) {
          addLine('error', `cd: no such file or directory: ${target}`);
        } else if (!node.isDirectory) {
          addLine('error', `cd: not a directory: ${target}`);
        } else {
          setCurrentDir(resolved);
        }
        break;
      }

      case 'ls': {
        try {
          const isLong = args.includes('-l');
          const targetArg = args.find((a) => !a.startsWith('-'));
          let targetPath = currentDir;
          if (targetArg) {
            targetPath = targetArg.startsWith('/') ? targetArg : `${currentDir}/${targetArg}`;
          }
          const items = vfsService.listDir(targetPath);
          if (items.length === 0) {
            addLine('output', '(empty directory)');
          } else if (isLong) {
            const output = items
              .map(
                (item) =>
                  `${item.permissions}  ${item.owner.padEnd(6)}  ${String(item.size).padStart(6)}B  ${item.isDirectory ? item.name + '/' : item.name}`
              )
              .join('\n');
            addLine('output', output);
          } else {
            const formatted = items
              .map((item) => (item.isDirectory ? `\x1b[34m${item.name}/\x1b[0m` : item.name))
              .join('   ');
            addLine('output', formatted);
          }
        } catch (err: any) {
          addLine('error', err.message || 'ls failed');
        }
        break;
      }

      case 'cat': {
        if (!args[0]) {
          addLine('error', 'cat: missing filename');
          break;
        }
        const filePath = args[0].startsWith('/') ? args[0] : `${currentDir}/${args[0]}`;
        try {
          const content = vfsService.readFile(filePath);
          addLine('output', content || '(empty file)');
        } catch (err: any) {
          addLine('error', `cat: ${err.message}`);
        }
        break;
      }

      case 'touch': {
        if (!args[0]) {
          addLine('error', 'touch: missing file name');
          break;
        }
        const fileName = args[0];
        const content = args.slice(1).join(' ');
        try {
          vfsService.touchFile(currentDir, fileName, content);
          addLine('output', `Created file '${fileName}' in ${currentDir}`);
        } catch (err: any) {
          addLine('error', `touch: ${err.message}`);
        }
        break;
      }

      case 'mkdir': {
        if (!args[0]) {
          addLine('error', 'mkdir: missing directory name');
          break;
        }
        const dirName = args[0];
        try {
          vfsService.makeDir(currentDir, dirName);
          addLine('output', `Created directory '${dirName}' in ${currentDir}`);
        } catch (err: any) {
          addLine('error', `mkdir: ${err.message}`);
        }
        break;
      }

      case 'rm': {
        if (!args[0]) {
          addLine('error', 'rm: missing operand');
          break;
        }
        const targetPath = args[0].startsWith('/') ? args[0] : `${currentDir}/${args[0]}`;
        try {
          vfsService.removeNode(targetPath);
          addLine('output', `Removed '${targetPath}'`);
        } catch (err: any) {
          addLine('error', `rm: ${err.message}`);
        }
        break;
      }

      case 'ps': {
        const procs = processService.getProcesses();
        const header = '  PID  STATUS   CPU%    RAM   COMMAND';
        const rows = procs
          .map(
            (p) =>
              `${String(p.pid).padStart(5)}  ${p.status.padEnd(7)}  ${p.cpuPercent.padStart(5)}  ${(p.memoryMb + 'MB').padStart(5)}   ${p.command} ${p.args}`
          )
          .join('\n');
        addLine('output', `${header}\n${rows}`);
        break;
      }

      case 'kill': {
        const pid = parseInt(args[0], 10);
        if (isNaN(pid)) {
          addLine('error', 'kill: usage: kill <pid>');
          break;
        }
        const success = processService.kill(pid);
        if (success) {
          addLine('output', `Process ${pid} terminated.`);
        } else {
          addLine('error', `kill: failed to terminate process ${pid}`);
        }
        break;
      }

      case 'top': {
        const summary = processService.getSummary();
        addLine(
          'output',
          `Tasks: ${summary.totalProcesses} total, ${summary.runningCount} running.
Memory: ${summary.totalMemoryMb} MB total used.
CPU: ${summary.totalCpuPercent} load.
Architecture: Vercel Serverless Function Workers.`
        );
        break;
      }

      case 'neofetch': {
        addLine(
          'output',
          `        /\\         OS: AetherOS 1.0 (Vercel Serverless)
       /  \\        Kernel: 6.8.0-serverless-asgi
      / /\\ \\       Uptime: 2h 45m
     / /  \\ \\      Packages: 14 (vfs-nodes)
    / /    \\ \\     Shell: aether-sh 1.0
   / /  /\\  \\ \\    Resolution: ${window.innerWidth}x${window.innerHeight}
  / /  /  \\  \\ \\   WM: React DOM Window Compositor
 / /__/    \\__\\ \\  Terminal: Aether-VFS-Term
/____/      \\____\\ Database: Serverless Cloud Postgres (Neon)
                   Cache: Upstash Redis
                   Realtime: Pusher / Supabase Channels`
        );
        break;
      }

      default:
        soundService.playBeep();
        addLine('error', `bash: command not found: ${cmd}. Type "help" for a list of commands.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx + 1;
        if (nextIdx < history.length) {
          setHistoryIdx(nextIdx);
          setInputVal(history[history.length - 1 - nextIdx]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="h-full w-full bg-slate-950 p-3 font-mono text-xs text-slate-200 overflow-y-auto cursor-text flex flex-col"
    >
      <div className="flex-1 space-y-1">
        {lines.map((line) => (
          <div key={line.id} className="whitespace-pre-wrap leading-relaxed break-words">
            {line.type === 'input' && (
              <span className="text-emerald-400 font-semibold">{line.text}</span>
            )}
            {line.type === 'system' && (
              <span className="text-sky-400">{line.text}</span>
            )}
            {line.type === 'output' && (
              <span className="text-slate-300">{line.text}</span>
            )}
            {line.type === 'error' && (
              <span className="text-rose-400">{line.text}</span>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-900 mt-2 shrink-0">
        <span className="text-emerald-400 font-semibold shrink-0">
          user@aether:{currentDir}$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent text-slate-100 outline-none font-mono text-xs caret-sky-400"
          placeholder="Type 'help'..."
        />
      </div>
    </div>
  );
};
