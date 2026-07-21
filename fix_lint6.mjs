import fs from 'fs';

let ot = fs.readFileSync('src/core/orchestrator.ts', 'utf8');
ot = ot.replace(/let isReplaced = /g, 'const isReplaced = ');
fs.writeFileSync('src/core/orchestrator.ts', ot);

