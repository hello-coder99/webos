import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { vfsService } from '../services/vfsService';
import { soundService } from '../services/soundService';

interface TextEditorProps {
  filePath?: string;
}

export const TextEditorApp: React.FC<TextEditorProps> = ({ filePath = '/home/user/README.md' }) => {
  const [currentPath, setCurrentPath] = useState<string>(filePath);
  const [content, setContent] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'unsaved'>('saved');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const loadFile = (path: string) => {
    try {
      const text = vfsService.readFile(path);
      setContent(text);
      setIsDirty(false);
      setSaveStatus('saved');
      setStatusMessage(`Loaded ${path}`);
    } catch (err: any) {
      setContent('');
      setSaveStatus('error');
      setStatusMessage(err.message || 'Error loading file');
    }
  };

  useEffect(() => {
    if (filePath) {
      setCurrentPath(filePath);
      loadFile(filePath);
    }
  }, [filePath]);

  const handleSave = () => {
    try {
      setSaveStatus('saving');
      vfsService.writeFile(currentPath, content);
      setIsDirty(false);
      setSaveStatus('saved');
      setStatusMessage('File saved to VFS successfully');
      soundService.playClick();
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save file');
    }
  };

  const lineCount = content.split('\n').length;
  const charCount = content.length;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 text-xs font-mono">
      {/* Top Action Bar */}
      <div className="h-10 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 flex-1 mr-4">
          <FileText className="w-4 h-4 text-sky-400 shrink-0" />
          <input
            type="text"
            value={currentPath}
            onChange={(e) => setCurrentPath(e.target.value)}
            onBlur={() => loadFile(currentPath)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-sky-500"
            title="Edit path and click out or press Enter to switch file"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadFile(currentPath)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Reload from VFS"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty && saveStatus === 'saved'}
            className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-sans text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex min-h-0 bg-slate-950 overflow-hidden">
        {/* Line Numbers */}
        <div className="w-12 bg-slate-900/60 border-r border-slate-800/80 select-none py-3 text-right pr-2 font-mono text-slate-600 text-xs leading-5">
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setIsDirty(true);
            setSaveStatus('unsaved');
          }}
          className="flex-1 bg-transparent p-3 text-slate-100 font-mono text-xs leading-5 outline-none resize-none overflow-auto whitespace-pre font-normal"
          placeholder="Type here..."
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 px-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-sans shrink-0">
        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Saved</span>
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="flex items-center gap-1 text-amber-400">
              <AlertCircle className="w-3 h-3" />
              <span>Unsaved changes</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-rose-400">{statusMessage}</span>
          )}
        </div>
        <div className="flex items-center gap-4 font-mono tabular-nums">
          <span>{lineCount} lines</span>
          <span>{charCount} chars</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
