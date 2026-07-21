import fs from 'fs';

let ac = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
ac = ac.replace(/import \{ obfuscateText, generateSecureKey \} from '\.\.\/core';/g, "import { generateSecureKey } from '../core';");
fs.writeFileSync('src/context/AppContext.tsx', ac);

