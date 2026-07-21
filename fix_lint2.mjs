import fs from 'fs';

// Workspace.tsx
let ws = fs.readFileSync('src/components/Workspace.tsx', 'utf8');
ws = ws.replace(/const \{ tokens, diagnostics \} = React\.useMemo/g, 'const { tokens } = React.useMemo');
fs.writeFileSync('src/components/Workspace.tsx', ws);

// AppContext.tsx
let ac = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
ac = ac.replace(/import \{ obfuscateText, ObfuscationParams \} from '\.\.\/core';\n/g, 'import { ObfuscationParams } from \'../core\';\n');
ac = ac.replace(/} catch \{/g, '} catch (e) { /* ignore */');
fs.writeFileSync('src/context/AppContext.tsx', ac);

