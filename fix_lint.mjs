import fs from 'fs';

// SettingsPanel.tsx
let sp = fs.readFileSync('src/components/SettingsPanel.tsx', 'utf8');
sp = sp.replace(/Zap, /g, '');
fs.writeFileSync('src/components/SettingsPanel.tsx', sp);

// Workspace.tsx
let ws = fs.readFileSync('src/components/Workspace.tsx', 'utf8');
ws = ws.replace(/const \{ tokens, diagnostics \} = /g, 'const { tokens } = ');
fs.writeFileSync('src/components/Workspace.tsx', ws);

// AppContext.tsx
let ac = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
ac = ac.replace(/import \{ obfuscateText \} from '\.\.\/core';\n/g, '');
ac = ac.replace(/} catch \(e\) {/g, '} catch {');
ac = ac.replace(/let shrunkArray = /g, 'const shrunkArray = ');
ac = ac.replace(/} catch \(err2\) {/g, '} catch {');
fs.writeFileSync('src/context/AppContext.tsx', ac);

// random.ts
let rt = fs.readFileSync('src/core/random.ts', 'utf8');
rt = rt.replace(/} catch \(e\) {/g, '} catch {');
fs.writeFileSync('src/core/random.ts', rt);

// orchestrator.ts
let ot = fs.readFileSync('src/core/orchestrator.ts', 'utf8');
ot = ot.replace(/let isReplaced = false;/g, '');
ot = ot.replace(/isReplaced = true;/g, '');
fs.writeFileSync('src/core/orchestrator.ts', ot);

