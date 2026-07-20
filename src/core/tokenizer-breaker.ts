import { ProcessedToken } from '../../types';
import { getStableRandomWithHash } from './random';

const RE_WORD_OR_NUM = /\p{L}|\p{N}/u;
const BREAKING_CHARS = ['\u00AD', '\u034F', '\u2062', '\u2063']; 
const SPACE_REPLACEMENTS = ['\u2004', '\u2005', '\u2009', '\u200A'];

export function applyTokenizerBreaker(tokens: ProcessedToken[], saltHash: number): { tokens: ProcessedToken[], markerCount: number } {
  let markerCount = 0;
  const newTokens: ProcessedToken[] = [];
  
  for (const token of tokens) {
    if (token.type === 'token') {
       newTokens.push(token);
       continue;
    }
    
    const tokenChars = Array.from(token.char);
    let brokenChar = '';
    
    for (let i = 0; i < tokenChars.length; i++) {
      const char = tokenChars[i];
      
      if (char === ' ') {
        const spaceProb = getStableRandomWithHash(i + 5000, 32, saltHash);
        if (spaceProb < 0.5) { 
          const replacer = SPACE_REPLACEMENTS[Math.floor(spaceProb * 2 * SPACE_REPLACEMENTS.length)];
          brokenChar += replacer;
          markerCount++;
          continue;
        }
      }
      
      brokenChar += char;
      if (RE_WORD_OR_NUM.test(char)) {
        const charCode = char.codePointAt(0) || 0;
        const breakProb = getStableRandomWithHash(i + 4000, charCode, saltHash);
        if (breakProb < 0.4) { 
          const breaker = BREAKING_CHARS[Math.floor(breakProb * 2.5 * BREAKING_CHARS.length)];
          brokenChar += breaker;
          markerCount++;
        }
      }
    }
    
    newTokens.push({ type: token.type, char: brokenChar });
  }
  
  return { tokens: newTokens, markerCount };
}
