# AetherOS Serverless Architecture (Phases 1 & 2)

## 1. Cloud Serverless Postgres (Neon / Supabase) Schema
The Virtual File System (VFS) is structured as a relational adjacency tree in Postgres:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE vfs_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX idx_vfs_parent_name ON vfs_nodes (parent_id, name);
CREATE INDEX idx_vfs_path ON vfs_nodes (path);
```

## 2. Serverless Process Registry (Upstash Redis + Postgres)
- Fast lookups and ephemeral execution metrics are managed via Upstash Serverless Redis:
  - Key: `os:session:{session_id}:processes` (Hash or List of PID items)
  - Key: `os:process:{pid}:metrics` (TTL 60s CPU/Memory tick)
- Durable logs are archived to `os_processes` table in Postgres.

## 3. Real-time IPC (Pusher / Supabase Realtime)
- Channels:
  - `aether-system`: Global OS broadcast (system notifications, shutdown/reboot)
  - `aether-taskbar`: Taskbar window minimization/focus synchronization
  - `aether-vfs`: File modification events (`vfs:created`, `vfs:updated`, `vfs:deleted`)
- WebSockets are not used directly on Vercel Serverless; client subscribes via Pusher JS SDK / Supabase Realtime client.

## 4. Vercel Serverless Routing (`vercel.json`)
- All requests matching `/api/(.*)` route to `@vercel/python` executing `api/index.py` using ASGI.
- All static assets route to the compiled Vite React frontend.
