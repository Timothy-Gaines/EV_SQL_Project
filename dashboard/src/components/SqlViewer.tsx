import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronDown, ChevronRight, Code2 } from 'lucide-react';

interface SqlViewerProps {
  sql: string;
  title?: string;
}

const customTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: '#0d1117',
    fontSize: '12px',
    lineHeight: '1.6',
    margin: 0,
    padding: '1.25rem',
    borderRadius: 0,
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: 'transparent',
    fontFamily: "'JetBrains Mono', monospace",
  },
};

export default function SqlViewer({ sql, title = 'View SQL Query' }: SqlViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-base-600/20 transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <Code2 size={16} className="text-accent-purple shrink-0" />
        <span className="text-sm font-medium text-txt-secondary">{title}</span>
        <span className="ml-auto text-txt-muted">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {open && (
        <div className="border-t border-base-600/40 overflow-x-auto max-h-[500px] overflow-y-auto">
          <SyntaxHighlighter
            language="sql"
            style={customTheme}
            showLineNumbers
            lineNumberStyle={{ color: '#30363d', fontSize: '11px', minWidth: '2.5em' }}
          >
            {sql.trim()}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
