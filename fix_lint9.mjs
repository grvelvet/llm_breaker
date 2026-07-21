import fs from 'fs';

let sp = fs.readFileSync('src/components/SettingsPanel.tsx', 'utf8');
sp = sp.replace(/ease: 'easeInOut',/g, "ease: 'easeInOut' as const,");
sp = sp.replace(/ease: 'easeInOut'/g, "ease: 'easeInOut' as const");
sp = sp.replace(/ease: 'easeOut',/g, "ease: 'easeOut' as const,");
sp = sp.replace(/ease: 'easeOut'/g, "ease: 'easeOut' as const");
fs.writeFileSync('src/components/SettingsPanel.tsx', sp);

