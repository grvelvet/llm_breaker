import fs from 'fs';

// Workspace.tsx
let ws = fs.readFileSync('src/components/Workspace.tsx', 'utf8');
ws = ws.replace(/diagnostics,\n/g, '');
fs.writeFileSync('src/components/Workspace.tsx', ws);

// AppContext.tsx
let ac = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
ac = ac.replace(/import \{ obfuscateText \} from '\.\.\/core';/g, '');
ac = ac.replace(/catch \(e\)/g, 'catch (_e)');
fs.writeFileSync('src/context/AppContext.tsx', ac);

