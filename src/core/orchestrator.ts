import { ProcessedToken, Diagnostics, TokenType, InjectStrategy, TextStyle, TranslitMode, SplitStrategy, SplitStyle } from '../types';
import { fnv1a, getStableRandomWithHash } from './random';
import { characterMatrix, invisiblePool, mathFonts } from './constants';
import { stableShuffleWords, stableInjectTypos, transliterateText, applyStyleToChar } from './transformers';
import { applyTokenizerBreaker } from './tokenizer-breaker';
import { splitPayload } from './payload-splitter';

const RE_WORD_OR_NUM = /\p{L}|\p{N}/u;

export interface ObfuscationParams {
  inputText: string;
  keySalt: string;
  randomSlider: number;
  shuffleSlider: number;
  aiSlider: number;
  classifierBypass?: number;
  injectStrategy: InjectStrategy;
  textStyle?: TextStyle;
  translitMode?: TranslitMode;
  breakTokenizer?: boolean;
  payloadSplitting?: boolean;
  splitStrategy?: SplitStrategy;
  splitStyle?: SplitStyle;
  splitChunkSize?: number;
  jsonImageMode?: boolean;
  parsedJsonObj?: Record<string, any>;
}

export interface ObfuscationResult {
  rawOutputText: string;
  tokens: ProcessedToken[];
  diagnostics: Diagnostics;
}

export function obfuscateText(params: ObfuscationParams): ObfuscationResult {
  const {
    inputText,
    keySalt,
    randomSlider,
    shuffleSlider,
    aiSlider,
    classifierBypass = 0,
    injectStrategy,
    textStyle,
    translitMode,
    breakTokenizer,
    payloadSplitting,
    splitStrategy = 'simple',
    splitStyle = 'algebraic',
    splitChunkSize = 3,
    jsonImageMode = false,
    parsedJsonObj,
  } = params;

  
  const safeInput = typeof inputText === 'string' ? inputText : String(inputText ?? '');

  if (jsonImageMode && safeInput.trim() && parsedJsonObj) {
    const combinedTokens: ProcessedToken[] = [];
    let replacedCount = 0;
    let markerCount = 0;

    const processObject = (obj: any, indent: string): void => {
      combinedTokens.push({ type: 'text', char: '{\n' });
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];

        combinedTokens.push({ type: 'text', char: `${indent}  "${key}": ` });

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
           processObject(value, indent + '  ');
        } else if (Array.isArray(value)) {
           combinedTokens.push({ type: 'text', char: '[\n' });
           for (let j = 0; j < value.length; j++) {
             combinedTokens.push({ type: 'text', char: `${indent}    "` });
             const subResult = obfuscateText({
                ...params,
                inputText: value[j],
                jsonImageMode: false,
                parsedJsonObj: undefined
             });
             combinedTokens.push(...subResult.tokens);
             replacedCount += subResult.diagnostics.replacedCount;
             markerCount += subResult.diagnostics.markerCount;
             combinedTokens.push({ type: 'text', char: j < value.length - 1 ? '",\n' : '"\n' });
           }
           combinedTokens.push({ type: 'text', char: `${indent}  ]` });
        } else {
           combinedTokens.push({ type: 'text', char: '"' });
           const subResult = obfuscateText({
              ...params,
              inputText: String(value),
              jsonImageMode: false,
              parsedJsonObj: undefined
           });
           combinedTokens.push(...subResult.tokens);
           replacedCount += subResult.diagnostics.replacedCount;
           markerCount += subResult.diagnostics.markerCount;
           combinedTokens.push({ type: 'text', char: '"' });
        }

        if (i < keys.length - 1) {
          combinedTokens.push({ type: 'text', char: ',\n' });
        } else {
          combinedTokens.push({ type: 'text', char: '\n' });
        }
      }
      combinedTokens.push({ type: 'text', char: `${indent}}` });
    };

    processObject(parsedJsonObj, '');

    const rawOutputText = combinedTokens.map(t => t.char).join('');

    return {
      rawOutputText,
      tokens: combinedTokens,
      diagnostics: {
        replacedCount,
        markerCount,
        entropyLevel: replacedCount > 10 ? 'Максимальная' : replacedCount > 0 ? 'Средняя' : 'Низкая',
        tokenImpact: markerCount
      }
    };
  }

  // Приведение к прекомпозиционной схеме (NFC)
  let text = safeInput.normalize('NFC');
  
  if (translitMode && translitMode !== 'none') {
    text = transliterateText(text, translitMode);
  }

  const normalizedSalt = keySalt || 'DEFAULT';

  if (!text) {
    return {
      rawOutputText: '',
      tokens: [],
      diagnostics: {
        replacedCount: 0,
        markerCount: 0,
        entropyLevel: 'Низкая',
        tokenImpact: 0,
      },
    };
  }

  const shuffleRate = shuffleSlider / 100;
  if (shuffleRate > 0) {
    text = stableShuffleWords(text, shuffleRate, normalizedSalt);
  }

  const classifierBypassRate = classifierBypass / 100;
  if (classifierBypassRate > 0) {
    text = stableInjectTypos(text, classifierBypassRate, normalizedSalt);
  }

  const mixRate = randomSlider / 100;
  const aiRate = aiSlider / 100;

  const chars = Array.from(text);
  const processedTokens: ProcessedToken[] = [];
  const rawOutputArr: string[] = [];

  let replacedCount = 0;
  let markerCount = 0;

  const saltHash = fnv1a(normalizedSalt);
  let currentToken: ProcessedToken | null = null;

  function addToken(type: TokenType, char: string) {
    if (currentToken && currentToken.type === type) {
      currentToken.char += char;
    } else {
      if (currentToken) {
        processedTokens.push(currentToken);
      }
      currentToken = { type, char };
    }
  }

  chars.forEach((char, index) => {
    const charCode = char.codePointAt(0) || 0;
    const matches = characterMatrix[char];
    const hasMatches = matches && matches.length > 0;

    const prob = getStableRandomWithHash(index, charCode, saltHash);
    const shouldReplace = hasMatches && prob < mixRate;

    let targetChar = char;
    

    if (shouldReplace) {
      const variantRand = getStableRandomWithHash(index + 500, charCode, saltHash);
      const variantIdx = Math.floor(variantRand * matches.length);
      targetChar = matches[variantIdx];
    }

    if (textStyle && textStyle !== 'normal') {
      if (textStyle === 'scrambled') {
        const styleKeys = Object.keys(mathFonts);
        const styleRand = getStableRandomWithHash(index + 3000, charCode, saltHash);
        const randomStyle = styleKeys[Math.floor(styleRand * styleKeys.length)];
        targetChar = applyStyleToChar(targetChar, randomStyle);
      } else {
        targetChar = applyStyleToChar(targetChar, textStyle);
      }
    }
    
    const isReplaced = targetChar !== char;

    if (isReplaced) {
      addToken('replaced', targetChar);
      replacedCount++;
    } else {
      addToken('text', targetChar);
    }
    rawOutputArr.push(targetChar);

    // AI Token signature break
    const isWordChar = RE_WORD_OR_NUM.test(targetChar);
    const nextChar = chars[index + 1];
    const isNextWordChar = nextChar ? RE_WORD_OR_NUM.test(nextChar) : false;

    if (isWordChar && isNextWordChar) {
      const aiProb = getStableRandomWithHash(index + 1200, charCode, saltHash);
      if (aiProb < aiRate) {
        const markerIdx = Math.floor(
          getStableRandomWithHash(index + 2400, charCode, saltHash) * invisiblePool.length
        );
        const invisibleMarker = invisiblePool[markerIdx];

        if (injectStrategy === 'zero-width-spaces' || injectStrategy === 'mixed') {
          rawOutputArr.push(invisibleMarker);
          addToken('token', invisibleMarker);
          markerCount++;
        }
      }
    }
  });

  if (currentToken) {
    processedTokens.push(currentToken);
  }

  let finalRawOutputText = rawOutputArr.join('');
  let finalTokens = processedTokens;

  if (breakTokenizer) {
    const { tokens, markerCount: newMarkerCount } = applyTokenizerBreaker(finalTokens, saltHash);
    finalTokens = tokens;
    finalRawOutputText = finalTokens.map(t => t.char).join('');
    markerCount += newMarkerCount;
  }

  if (payloadSplitting) {
    const splitResult = splitPayload(
      finalTokens,
      saltHash,
      splitChunkSize,
      splitStrategy,
      splitStyle
    );
    
    finalRawOutputText = splitResult.text;
    finalTokens = splitResult.tokens;
    markerCount += splitResult.markerCount;
  }

  // Вычисление энтропии
  let entropyLevel: 'Низкая' | 'Средняя' | 'Максимальная' = 'Низкая';
  const totalMutation = replacedCount + markerCount;
  const totalChars = chars.length || 1;
  const mutationRatio = totalMutation / totalChars;

  if (mutationRatio > 0.4) {
    entropyLevel = 'Максимальная';
  } else if (mutationRatio > 0.15) {
    entropyLevel = 'Средняя';
  }

  // Влияние на ИИ-токены
  const tokenImpact = Math.min(Math.round((markerCount / totalChars) * 250), 100);

  return {
    rawOutputText: finalRawOutputText,
    tokens: finalTokens,
    diagnostics: {
      replacedCount,
      markerCount,
      entropyLevel,
      tokenImpact,
    },
  };
}
