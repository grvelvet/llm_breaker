import fs from 'fs';

let ac = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
ac = ac.replace(/console\.error\('Error loading history', e\);/g, "console.error('Error loading history', _e);");
fs.writeFileSync('src/context/AppContext.tsx', ac);

