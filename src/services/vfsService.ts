import { VFSNode } from '../types/os';
import { realtimeService } from './realtimeService';

const STORAGE_KEY = 'aether_vfs_nodes_v1';

const INITIAL_NODES: VFSNode[] = [
  {
    id: 'root-0000',
    parentId: null,
    name: '',
    path: '/',
    isDirectory: true,
    size: 4096,
    mimeType: 'inode/directory',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'home-0001',
    parentId: 'root-0000',
    name: 'home',
    path: '/home',
    isDirectory: true,
    size: 4096,
    mimeType: 'inode/directory',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-0002',
    parentId: 'home-0001',
    name: 'user',
    path: '/home/user',
    isDirectory: true,
    size: 4096,
    mimeType: 'inode/directory',
    permissions: 'drwxr-xr-x',
    owner: 'user',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'desktop-0003',
    parentId: 'user-0002',
    name: 'Desktop',
    path: '/home/user/Desktop',
    isDirectory: true,
    size: 4096,
    mimeType: 'inode/directory',
    permissions: 'drwxr-xr-x',
    owner: 'user',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'docs-0004',
    parentId: 'user-0002',
    name: 'Documents',
    path: '/home/user/Documents',
    isDirectory: true,
    size: 4096,
    mimeType: 'inode/directory',
    permissions: 'drwxr-xr-x',
    owner: 'user',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'downloads-0005',
    parentId: 'user-0002',
    name: 'Downloads',
    path: '/home/user/Downloads',
    isDirectory: true,
    size: 4096,
    mimeType: 'inode/directory',
    permissions: 'drwxr-xr-x',
    owner: 'user',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'file-0006',
    parentId: 'user-0002',
    name: 'README.md',
    path: '/home/user/README.md',
    isDirectory: false,
    size: 684,
    mimeType: 'text/markdown',
    content: `# AetherOS v1.0
Welcome to AetherOS — a high-performance Web Operating System designed for Vercel Serverless Functions.

## Features
- **Virtual File System (VFS)**: Adjacency-list relational database schema simulating POSIX directories & files.
- **Window Manager**: DOM-based compositor with dragging, 8-way resizing, maximize, and stacking z-index.
- **Stateless Process Manager**: Upstash Redis session caching model + background task orchestrator.
- **Real-Time IPC**: Event bus broadcasting window states, taskbar indicators, and filesystem updates.
- **Core Apps**: Terminal, File Explorer, Code/Text Editor, Process Monitor, and Architecture Inspector.
`,
    permissions: '-rw-r--r--',
    owner: 'user',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'file-0007',
    parentId: 'user-0002',
    name: 'system.conf',
    path: '/home/user/system.conf',
    isDirectory: false,
    size: 210,
    mimeType: 'text/plain',
    content: `HOSTNAME=aether-node-alpha
ARCH=x86_64-serverless
DATABASE_URI=postgres://neon.tech/aether_vfs
CACHE_PROVIDER=upstash-redis
REALTIME_CHANNEL=aether-system
WINDOW_COMPOSITOR=react-dom-v19
`,
    permissions: '-rw-r--r--',
    owner: 'user',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'file-0008',
    parentId: 'desktop-0003',
    name: 'welcome.txt',
    path: '/home/user/Desktop/welcome.txt',
    isDirectory: false,
    size: 198,
    mimeType: 'text/plain',
    content: `Quick Tips:
1. Double-click desktop icons or use the Start Menu to launch apps.
2. Open Terminal to run commands like 'ls', 'cat README.md', 'ps', 'neofetch'.
3. Inspect the live Postgres & Redis architecture in Architecture Inspector!
`,
    permissions: '-rw-r--r--',
    owner: 'user',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'file-0009',
    parentId: 'docs-0004',
    name: 'serverless-notes.md',
    path: '/home/user/Documents/serverless-notes.md',
    isDirectory: false,
    size: 382,
    mimeType: 'text/markdown',
    content: `### Serverless VFS Design Notes
- Traditional OS operations assume stateful disk.
- In serverless (Vercel + FastAPI), each HTTP request is ephemeral.
- Relational schema index on 'path' enables sub-10ms lookup without recursive subtree scanning.
- Redis cache handles hot directory listings.
`,
    permissions: '-rw-r--r--',
    owner: 'user',
    updatedAt: new Date().toISOString(),
  },
];

class VFSService {
  private nodes: Map<string, VFSNode> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as VFSNode[];
        this.nodes = new Map(parsed.map((n) => [n.path, n]));
        return;
      }
    } catch {
      // fallback to initial
    }
    this.nodes = new Map(INITIAL_NODES.map((n) => [n.path, n]));
    this.save();
  }

  private save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(this.nodes.values()))
      );
    } catch (e) {
      console.warn('Failed to save VFS to localStorage', e);
    }
  }

  public normalizePath(path: string): string {
    const parts = path.trim().replace(/\/+/g, '/').split('/').filter(Boolean);
    return parts.length === 0 ? '/' : '/' + parts.join('/');
  }

  public getNode(path: string): VFSNode | null {
    const clean = this.normalizePath(path);
    return this.nodes.get(clean) || null;
  }

  public listDir(path: string): VFSNode[] {
    const clean = this.normalizePath(path);
    const parentNode = this.nodes.get(clean);
    if (!parentNode) {
      throw new Error(`Directory '${clean}' not found`);
    }
    if (!parentNode.isDirectory) {
      throw new Error(`Path '${clean}' is not a directory`);
    }

    const children: VFSNode[] = [];
    for (const node of this.nodes.values()) {
      if (node.parentId === parentNode.id) {
        children.push(node);
      }
    }

    // Sort folders first, then alphabetical
    return children.sort((a, b) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name);
      }
      return a.isDirectory ? -1 : 1;
    });
  }

  public makeDir(parentPath: string, name: string): VFSNode {
    const cleanParent = this.normalizePath(parentPath);
    const parent = this.nodes.get(cleanParent);
    if (!parent) throw new Error(`Parent directory '${cleanParent}' not found`);
    if (!parent.isDirectory) throw new Error(`Parent '${cleanParent}' is not a directory`);

    const newPath = this.normalizePath(`${cleanParent}/${name}`);
    if (this.nodes.has(newPath)) {
      throw new Error(`Directory '${name}' already exists in '${cleanParent}'`);
    }

    const newNode: VFSNode = {
      id: 'dir-' + Math.random().toString(36).substring(2, 9),
      parentId: parent.id,
      name,
      path: newPath,
      isDirectory: true,
      size: 4096,
      mimeType: 'inode/directory',
      permissions: 'drwxr-xr-x',
      owner: 'user',
      updatedAt: new Date().toISOString(),
    };

    this.nodes.set(newPath, newNode);
    this.save();

    realtimeService.broadcast('aether-vfs', 'vfs:mkdir', { path: newPath, name });
    return newNode;
  }

  public touchFile(parentPath: string, name: string, content = ''): VFSNode {
    const cleanParent = this.normalizePath(parentPath);
    const parent = this.nodes.get(cleanParent);
    if (!parent) throw new Error(`Parent directory '${cleanParent}' not found`);
    if (!parent.isDirectory) throw new Error(`Parent '${cleanParent}' is not a directory`);

    const newPath = this.normalizePath(`${cleanParent}/${name}`);
    if (this.nodes.has(newPath)) {
      throw new Error(`File '${name}' already exists in '${cleanParent}'`);
    }

    const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : '';
    let mimeType = 'text/plain';
    if (ext === 'md') mimeType = 'text/markdown';
    else if (ext === 'json') mimeType = 'application/json';
    else if (ext === 'sh') mimeType = 'application/x-sh';
    else if (ext === 'py') mimeType = 'text/x-python';

    const newNode: VFSNode = {
      id: 'file-' + Math.random().toString(36).substring(2, 9),
      parentId: parent.id,
      name,
      path: newPath,
      isDirectory: false,
      size: new Blob([content]).size,
      mimeType,
      content,
      permissions: '-rw-r--r--',
      owner: 'user',
      updatedAt: new Date().toISOString(),
    };

    this.nodes.set(newPath, newNode);
    this.save();

    realtimeService.broadcast('aether-vfs', 'vfs:touch', { path: newPath, name });
    return newNode;
  }

  public readFile(path: string): string {
    const clean = this.normalizePath(path);
    const node = this.nodes.get(clean);
    if (!node) throw new Error(`File '${clean}' not found`);
    if (node.isDirectory) throw new Error(`Cannot read directory '${clean}' as file`);
    return node.content ?? '';
  }

  public writeFile(path: string, content: string): VFSNode {
    const clean = this.normalizePath(path);
    const node = this.nodes.get(clean);
    if (!node) throw new Error(`File '${clean}' not found`);
    if (node.isDirectory) throw new Error(`Cannot write content to directory '${clean}'`);

    node.content = content;
    node.size = new Blob([content]).size;
    node.updatedAt = new Date().toISOString();

    this.nodes.set(clean, node);
    this.save();

    realtimeService.broadcast('aether-vfs', 'vfs:write', { path: clean });
    return node;
  }

  public removeNode(path: string): void {
    const clean = this.normalizePath(path);
    if (clean === '/') throw new Error('Cannot delete root directory');
    const node = this.nodes.get(clean);
    if (!node) throw new Error(`Path '${clean}' not found`);

    // Remove node and all descendants
    const pathsToDelete: string[] = [];
    for (const [key] of this.nodes.entries()) {
      if (key === clean || key.startsWith(clean + '/')) {
        pathsToDelete.push(key);
      }
    }

    for (const p of pathsToDelete) {
      this.nodes.delete(p);
    }
    this.save();

    realtimeService.broadcast('aether-vfs', 'vfs:rm', { path: clean, count: pathsToDelete.length });
  }

  public renameNode(path: string, newName: string): VFSNode {
    const clean = this.normalizePath(path);
    if (clean === '/') throw new Error('Cannot rename root directory');
    const node = this.nodes.get(clean);
    if (!node) throw new Error(`Path '${clean}' not found`);

    const parentPath = clean.substring(0, clean.lastIndexOf('/')) || '/';
    const newPath = this.normalizePath(`${parentPath}/${newName}`);

    if (this.nodes.has(newPath)) {
      throw new Error(`Destination '${newPath}' already exists`);
    }

    this.nodes.delete(clean);
    node.name = newName;
    node.path = newPath;
    node.updatedAt = new Date().toISOString();
    this.nodes.set(newPath, node);

    // If directory, update all children's paths
    if (node.isDirectory) {
      for (const [k, child] of this.nodes.entries()) {
        if (k.startsWith(clean + '/')) {
          const updatedChildPath = k.replace(clean, newPath);
          this.nodes.delete(k);
          child.path = updatedChildPath;
          this.nodes.set(updatedChildPath, child);
        }
      }
    }

    this.save();
    realtimeService.broadcast('aether-vfs', 'vfs:rename', { oldPath: clean, newPath });
    return node;
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.nodes = new Map(INITIAL_NODES.map((n) => [n.path, n]));
    this.save();
    realtimeService.broadcast('aether-vfs', 'vfs:reset', {});
  }

  public getAllNodes(): VFSNode[] {
    return Array.from(this.nodes.values());
  }
}

export const vfsService = new VFSService();
