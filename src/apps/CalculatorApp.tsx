import React, { useState } from 'react';
import { soundService } from '../services/soundService';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [newNumber, setNewNumber] = useState(true);

  const handleDigit = (digit: string) => {
    soundService.playClick();
    if (newNumber) {
      setDisplay(digit);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleOp = (op: string) => {
    soundService.playClick();
    setEquation(`${display} ${op} `);
    setNewNumber(true);
  };

  const handleEqual = () => {
    soundService.playClick();
    try {
      const full = `${equation}${display}`;
      // Safe arithmetic evaluator
      const sanitized = full.replace(/[^0-9+\-*/.]/g, '');
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      setDisplay(String(result));
      setEquation('');
      setNewNumber(true);
    } catch {
      setDisplay('Error');
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    soundService.playClick();
    setDisplay('0');
    setEquation('');
    setNewNumber(true);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 p-4 text-slate-100 font-sans select-none justify-between">
      {/* Display Screen */}
      <div className="bg-slate-900 border border-slate-800 rounded p-3 text-right">
        <div className="h-4 text-[11px] text-slate-500 font-mono overflow-hidden truncate">
          {equation}
        </div>
        <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight overflow-x-auto">
          {display}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2 mt-3 flex-1">
        <button
          onClick={handleClear}
          className="col-span-2 p-2.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-medium text-xs border border-rose-900/50"
        >
          C
        </button>
        <button
          onClick={() => handleOp('/')}
          className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs"
        >
          ÷
        </button>
        <button
          onClick={() => handleOp('*')}
          className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs"
        >
          ×
        </button>

        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('-')}
          className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs"
        >
          −
        </button>

        {['4', '5', '6'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('+')}
          className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs"
        >
          +
        </button>

        {['1', '2', '3'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800"
          >
            {d}
          </button>
        ))}
        <button
          onClick={handleEqual}
          className="row-span-2 p-2.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center justify-center"
        >
          =
        </button>

        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 p-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800"
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800"
        >
          .
        </button>
      </div>
    </div>
  );
};
