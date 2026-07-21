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
  } = params;

  // Приведение к прекомпозиционной схеме (NFC)
  let text = inputText.normalize('NFC');
  
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
