import fs from 'fs';
let code = fs.readFileSync('src/components/SettingsPanel.tsx', 'utf8');

code = code.replace(/ref=\{containerRef as any\}/g, 'ref={containerRef}');
code = code.replace(/containerRef=\{dropdownRef as any\}/g, 'containerRef={dropdownRef}');
code = code.replace(/containerRef=\{styleDropdownRef as any\}/g, 'containerRef={styleDropdownRef}');
code = code.replace(/containerRef=\{translitDropdownRef as any\}/g, 'containerRef={translitDropdownRef}');
code = code.replace(/setInjectStrategy\(value as any\)/g, 'setInjectStrategy(value as any)');
// We'll leave the parameter `as any` because TS might complain if the generic types don't match, though we could change onChange: (val: string) => void to onChange: (val: any) => void

fs.writeFileSync('src/components/SettingsPanel.tsx', code);
