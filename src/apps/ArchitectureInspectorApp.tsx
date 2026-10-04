import React, { useState } from 'react';
import { Database, Server, Radio, Layers, Code, CheckCircle, ExternalLink, Terminal, Cpu } from 'lucide-react';
import { useOS } from '../context/OSContext';

export const ArchitectureInspectorApp: React.FC = () => {
  const { realtimeEvents } = useOS();
  const [activeTab, setActiveTab] = useState<'overview' | 'postgres' | 'fastapi' | 'realtime' | 'vercel'>('overview');

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 text-xs">
      {/* Tab Navigation */}
      <div className="h-10 px-3 bg-slate-900 border-b border-slate-800 flex items-center gap-1 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'overview' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>System Topology</span>
        </button>
        <button
          onClick={() => setActiveTab('postgres')}
          className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'postgres' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Postgres VFS Schema (Phase 1)</span>
        </button>
        <button
          onClick={() => setActiveTab('fastapi')}
          className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'fastapi' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>FastAPI Endpoints (Phase 2)</span>
        </button>
        <button
          onClick={() => setActiveTab('realtime')}
          className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'realtime' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Pusher Realtime IPC (Phase 3)</span>
        </button>
        <button
          onClick={() => setActiveTab('vercel')}
          className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'vercel' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>vercel.json Config</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Vercel Serverless Web OS Architecture Matrix
              </h2>
              <p className="text-slate-400 leading-relaxed text-xs">
                AetherOS is engineered specifically to operate within the constraints of serverless edge infrastructure.
                Traditional operating systems rely on stateful kernels and file locks on local disks. AetherOS decouples
                the kernel into stateless microservices, distributed relational trees, and ephemeral Redis session caching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded border border-slate-800 bg-slate-900/50 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <Database className="w-4 h-4" />
                  <span>VFS Storage</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Relational tree hierarchy in Neon/Supabase Postgres. Indexed paths eliminate recursive subtree disk I/O.
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Status: Operational (SQLAlchemy)</span>
              </div>

              <div className="p-3 rounded border border-slate-800 bg-slate-900/50 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-semibold">
                  <Cpu className="w-4 h-4" />
                  <span>Process Management</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Upstash Serverless Redis caches active tasks, TTL leases, and background daemons statelessly.
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Status: Upstash Cache Active</span>
              </div>

              <div className="p-3 rounded border border-slate-800 bg-slate-900/50 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Radio className="w-4 h-4" />
                  <span>Real-time IPC Bus</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Pusher / Supabase Realtime pub/sub replaces native WebSockets for seamless window state synchronization.
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Status: Event Bus Subscribed</span>
              </div>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="p-4 rounded border border-slate-800 bg-slate-950 font-mono text-[11px] text-slate-300 space-y-2 overflow-x-auto">
              <div className="text-slate-500 font-semibold mb-2">[ Execution Flow ]</div>
              <div>Browser (React 19 Window Compositor)</div>
              <div className="text-sky-400">   │  HTTP CRUD (/api/vfs/*)          │  Pusher Subscriptions</div>
              <div className="text-sky-400">   ▼                                  ▼</div>
              <div>Vercel Serverless Function (FastAPI ASGI) ────► Pusher Channels / Broadcast</div>
              <div className="text-emerald-400">   │                 │</div>
              <div className="text-emerald-400">   ▼                 ▼</div>
              <div>Neon Postgres     Upstash Redis</div>
              <div>(VFS Nodes)       (Process Tasks)</div>
            </div>
          </div>
        )}

        {activeTab === 'postgres' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200">
                PostgreSQL Schema Definition (`api/schema.py` & Neon DDL)
              </h3>
              <span className="text-[11px] font-mono text-sky-400">Table: vfs_nodes</span>
            </div>
            <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto">
{`CREATE TABLE vfs_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES vfs_nodes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(1024) NOT NULL UNIQUE,
    is_directory BOOLEAN NOT NULL DEFAULT FALSE,
    size BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(64) NOT NULL DEFAULT 'text/plain',
    content TEXT DEFAULT '',
    permissions VARCHAR(10) NOT NULL DEFAULT '-rw-r--r--',
    owner VARCHAR(64) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crucial indexes for sub-10ms stateless path lookups
CREATE INDEX idx_vfs_parent_name ON vfs_nodes (parent_id, name);
CREATE INDEX idx_vfs_path ON vfs_nodes (path);`}
            </pre>

            <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-400 space-y-1">
              <strong className="text-slate-200">Why Adjacency Tree with Full-Path Indexing?</strong>
              <p>
                In serverless environments, traversing child pointers recursively across multiple DB round trips introduces latency.
                Indexing `path` provides $O(1)$ single-query direct lookups for `/cat`, `/touch`, and `/read`, while `parent_id` enables
                instant directory listings (`/ls`) in a single indexed query.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'fastapi' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-200">
              FastAPI Stateless Serverless Routes (`api/index.py`)
            </h3>
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded bg-slate-900/60 font-mono text-xs">
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 text-[10px] font-bold">GET</span>
                  <span className="text-slate-200">/api/vfs/ls?path=...</span>
                </div>
                <span className="text-slate-500 text-[11px]">List folder children</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">POST</span>
                  <span className="text-slate-200">/api/vfs/mkdir</span>
                </div>
                <span className="text-slate-500 text-[11px]">Create directory node</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">POST</span>
                  <span className="text-slate-200">/api/vfs/touch</span>
                </div>
                <span className="text-slate-500 text-[11px]">Create new file node</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 text-[10px] font-bold">GET</span>
                  <span className="text-slate-200">/api/vfs/read?path=...</span>
                </div>
                <span className="text-slate-500 text-[11px]">Read file content</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 text-[10px] font-bold">DELETE</span>
                  <span className="text-slate-200">/api/vfs/rm?path=...</span>
                </div>
                <span className="text-slate-500 text-[11px]">Delete file or subtree</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 text-[10px] font-bold">GET</span>
                  <span className="text-slate-200">/api/process/list</span>
                </div>
                <span className="text-slate-500 text-[11px]">Upstash Redis cached tasks</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'realtime' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200">
                Real-Time IPC Stream (Pusher Channels / Event Bus)
              </h3>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Listeners Active
              </span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded max-h-64 overflow-y-auto space-y-2 font-mono text-[11px]">
              {realtimeEvents.length === 0 ? (
                <div className="text-slate-500 italic">No events broadcasted yet. Open or move a window or run commands in terminal.</div>
              ) : (
                realtimeEvents.map((evt) => (
                  <div key={evt.id} className="p-1.5 rounded bg-slate-950 border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="text-sky-400 font-semibold">[{evt.channel}]</span>{' '}
                      <span className="text-amber-300">{evt.event}</span>
                    </div>
                    <span className="text-slate-500 text-[10px] tabular-nums">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'vercel' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-200">
              Vercel Deployment Configuration (`vercel.json`)
            </h3>
            <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
{`{
  "version": 2,
  "framework": "vite",
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
