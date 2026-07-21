import fs from 'fs';

// SettingsPanel.tsx
let sp = fs.readFileSync('src/components/SettingsPanel.tsx', 'utf8');
sp = sp.replace(/type: 'spring',/g, "type: 'spring' as const,");
sp = sp.replace(/type: 'tween',/g, "type: 'tween' as const,");
sp = sp.replace(/containerRef: React\.RefObject<HTMLDivElement>/g, 'containerRef: React.RefObject<HTMLDivElement | null>');
fs.writeFileSync('src/components/SettingsPanel.tsx', sp);

// Workspace.tsx
let ws = fs.readFileSync('src/components/Workspace.tsx', 'utf8');
ws = ws.replace(/import \{ ProcessedToken \} from '\.\.\/types';/g, "import { ProcessedToken, HistoryEntry } from '../types';");
ws = ws.replace(/tok: any/g, 'tok: ProcessedToken');
fs.writeFileSync('src/components/Workspace.tsx', ws);

// AppContext.tsx
let ac = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
ac = ac.replace(/} catch \{\}/g, '} catch (_e) {}');
ac = ac.replace(/catch \(\)/g, 'catch (_e)');
fs.writeFileSync('src/context/AppContext.tsx', ac);

