import fs from 'fs';

// orchestrator.ts
let ot = fs.readFileSync('src/core/orchestrator.ts', 'utf8');
ot = ot.replace(/\.\.\/\.\.\/types/g, '../types');
ot = ot.replace(/isReplaced = /g, 'let isReplaced = ');
fs.writeFileSync('src/core/orchestrator.ts', ot);

// payload-splitter.ts
let ps = fs.readFileSync('src/core/payload-splitter.ts', 'utf8');
ps = ps.replace(/\.\.\/\.\.\/types/g, '../types');
ps = ps.replace(/const text = /g, 'const text: string = ');
fs.writeFileSync('src/core/payload-splitter.ts', ps);

// tokenizer-breaker.ts
let tb = fs.readFileSync('src/core/tokenizer-breaker.ts', 'utf8');
tb = tb.replace(/\.\.\/\.\.\/types/g, '../types');
fs.writeFileSync('src/core/tokenizer-breaker.ts', tb);

// AppContext.tsx
let ac = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
ac = ac.replace(/catch \(_e\)/g, 'catch (_e: unknown)');
ac = ac.replace(/setHistoryArray\(prev => /g, 'setHistoryArray((prev: HistoryEntry[]) => ');
fs.writeFileSync('src/context/AppContext.tsx', ac);

// Workspace.tsx
let ws = fs.readFileSync('src/components/Workspace.tsx', 'utf8');
ws = ws.replace(/tok =>/g, '(tok: any) =>');
ws = ws.replace(/\(tok, idx\) =>/g, '(tok: any, idx: number) =>');
ws = ws.replace(/entry =>/g, '(entry: any) =>');
fs.writeFileSync('src/components/Workspace.tsx', ws);
