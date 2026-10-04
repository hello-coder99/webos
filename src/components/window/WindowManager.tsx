import React from 'react';
import { useOS } from '../../context/OSContext';
import { WindowFrame } from './WindowFrame';
import { TerminalApp } from '../../apps/TerminalApp';
import { FileExplorerApp } from '../../apps/FileExplorerApp';
import { TextEditorApp } from '../../apps/TextEditorApp';
import { ProcessManagerApp } from '../../apps/ProcessManagerApp';
import { ArchitectureInspectorApp } from '../../apps/ArchitectureInspectorApp';
import { SettingsApp } from '../../apps/SettingsApp';
import { CalculatorApp } from '../../apps/CalculatorApp';

export const WindowManager: React.FC = () => {
  const { windows } = useOS();

  const renderAppContent = (win: any) => {
    switch (win.appId) {
      case 'terminal':
        return <TerminalApp />;
      case 'explorer':
        return <FileExplorerApp initialPath={win.props?.initialPath} />;
      case 'editor':
        return <TextEditorApp filePath={win.props?.filePath} />;
      case 'processes':
        return <ProcessManagerApp />;
      case 'architecture':
        return <ArchitectureInspectorApp />;
      case 'settings':
        return <SettingsApp />;
      case 'calc':
        return <CalculatorApp />;
      default:
        return (
          <div className="p-4 text-xs text-slate-400">
            Unknown application ID: {win.appId}
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {windows.map((win) => (
        <div key={win.id} className="pointer-events-auto">
          <WindowFrame win={win}>{renderAppContent(win)}</WindowFrame>
        </div>
      ))}
    </div>
  );
};
