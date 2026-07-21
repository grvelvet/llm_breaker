import { splitPayload } from './src/core/payload-splitter';
import { ProcessedToken } from './src/types';

const tokens: ProcessedToken[] = [
  { type: 'text', char: 'Hello \n' },
  { type: 'text', char: 'world, this is ' },
  { type: 'text', char: 'a test.' }
];

const res = splitPayload(tokens, 123, 2, 'simple', 'algebraic');
console.log(JSON.stringify(res.tokens, null, 2));
