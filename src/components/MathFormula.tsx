import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  formula: string;
  block?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ formula, block = true, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      console.warn('KaTeX parsing error:', e);
      return `<code class="text-rose-400 font-mono text-xs">${formula}</code>`;
    }
  }, [formula, block]);

  return (
    <div
      className={`katex-wrapper overflow-x-auto my-2 py-1 ${
        block ? 'text-center text-slate-100' : 'inline-block text-cyan-300'
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
