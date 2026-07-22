import { fnv1a, mulberry32, getStableRandomWithHash } from './random';
import { mathFonts } from './constants';

const RE_SHUFFLE_SPLIT = /(\p{L}+|[^\p{L}]+)/gu;
const RE_IS_WORD = /^\p{L}+$/u;

// Перемешивание слов с сохранением разметки
export function stableShuffleWords(originalText: string, rate: number, keySalt: string): string {
  const safeText = typeof originalText === 'string' ? originalText : String(originalText ?? '');
  // Разделяем слова и другие символы
  const matches = safeText.match(RE_SHUFFLE_SPLIT) || [];
  const tokens = matches.map((val) => ({
    value: val,
    isWord: RE_IS_WORD.test(val),
  }));

  const wordIndices: number[] = [];
  tokens.forEach((t, idx) => {
    if (t.isWord) {
      wordIndices.push(idx);
    }
  });

  const saltHash = fnv1a(keySalt || 'DEFAULT');
  const selectedIndices: number[] = [];
  wordIndices.forEach((tokenIdx, i) => {
    const wordCharCode = tokens[tokenIdx].value.codePointAt(0) || 0;
    const rand = getStableRandomWithHash(i + 1500, wordCharCode, saltHash);
    if (rand < rate) {
      selectedIndices.push(tokenIdx);
    }
  });

  if (selectedIndices.length > 1) {
    const valuesToShuffle = selectedIndices.map((idx) => tokens[idx].value);

    for (let i = valuesToShuffle.length - 1; i > 0; i--) {
      const randVal = getStableRandomWithHash(i + 3500, i, saltHash);
      const j = Math.floor(randVal * (i + 1));
      const temp = valuesToShuffle[i];
      valuesToShuffle[i] = valuesToShuffle[j];
      valuesToShuffle[j] = temp;
    }

    selectedIndices.forEach((tokenIdx, i) => {
      tokens[tokenIdx].value = valuesToShuffle[i];
    });
  }

  return tokens.map((t) => t.value).join('');
}

export function stableInjectTypos(originalText: string, rate: number, keySalt: string): string {
  const safeText = typeof originalText === 'string' ? originalText : String(originalText ?? '');
  if (rate <= 0) return safeText;

  const matches = safeText.match(RE_SHUFFLE_SPLIT) || [];
  const saltHash = fnv1a(keySalt || 'DEFAULT');

  const russianNeighbors: Record<string, string> = {
    'а': 'фвы', 'б': 'ьюг', 'в': 'цыч', 'г': 'нрш', 'д': 'лжщ', 'е': 'кнв', 'ж': 'эдо', 'з': 'хщщ', 'и': 'мть',
    'й': 'цуф', 'к': 'еуа', 'л': 'дшор', 'м': 'исн', 'н': 'егр', 'о': 'лщтп', 'п': 'рнеи', 'р': 'опа', 'с': 'мыв',
    'т': 'оиь', 'у': 'квс', 'ф': 'йыа', 'х': 'зъэ', 'ц': 'увы', 'ч': 'вса', 'ш': 'гнл', 'щ': 'дзх', 'ъ': 'хж',
    'ы': 'фва', 'ь': 'тбю', 'э': 'жд', 'ю': 'бь.', 'я': 'чсм',
    'А': 'ФВЫ', 'Б': 'ЬЮГ', 'В': 'ЦЫЧ', 'Г': 'НРШ', 'Д': 'ЛЖЩ', 'Е': 'КНВ', 'Ж': 'ЭДО', 'З': 'ХЩЩ', 'И': 'МТЬ',
    'Й': 'ЦУФ', 'К': 'ЕУА', 'Л': 'ДШОР', 'М': 'ИСН', 'Н': 'ЕГР', 'О': 'ЛЩТП', 'П': 'РНЕИ', 'Р': 'ОПА', 'С': 'МЫВ',
    'Т': 'ОИЬ', 'У': 'КВС', 'Ф': 'ЙЫА', 'Х': 'ЗЪЭ', 'Ц': 'УВЫ', 'Ч': 'ВСА', 'Ш': 'ГНЛ', 'Щ': 'ДЗХ', 'Ы': 'ФВА',
    'Ь': 'ТБЮ', 'Ю': 'БЬ'
  };

  const englishNeighbors: Record<string, string> = {
    'a': 'qwsz', 'b': 'vghn', 'c': 'xdfv', 'd': 'ersf', 'e': 'wsdr', 'f': 'rtgv', 'g': 'tyhb', 'h': 'yujn', 'i': 'ujko',
    'j': 'uikm', 'k': 'ijlm', 'l': 'okp', 'm': 'njk', 'n': 'bhjm', 'o': 'iklp', 'p': 'ol', 'q': 'wa', 'r': 'edft',
    's': 'wedx', 't': 'rfgy', 'u': 'yhji', 'v': 'cfgb', 'w': 'qase', 'x': 'zsdx', 'y': 'tghu', 'z': 'asx',
    'A': 'QWSZ', 'B': 'VGHN', 'C': 'XDFV', 'D': 'ERSF', 'E': 'WSDR', 'F': 'RTGV', 'G': 'TYHB', 'H': 'YUJN', 'I': 'UJKO',
    'J': 'UIKM', 'K': 'IJLM', 'L': 'OKP', 'M': 'NJK', 'N': 'BHJM', 'O': 'IKLP', 'P': 'OL', 'Q': 'WA', 'R': 'EDFT',
    'S': 'WEDX', 'T': 'RFGY', 'U': 'YHJI', 'V': 'CFGB', 'W': 'QASE', 'X': 'ZSDX', 'Y': 'TGHU', 'Z': 'ASX'
  };

  const processed = matches.map((val, idx) => {
    const chars = [...val];
    if (!RE_IS_WORD.test(val) || chars.length < 3) {
      return val;
    }

    const firstChar = chars[0].codePointAt(0) || 0;
    const wordHash = saltHash ^ idx ^ firstChar;
    const rand = mulberry32(wordHash)();

    if (rand < rate) {
      const strategyRand = mulberry32(wordHash + 100)();
      // Strategies: 0 = Substitution, 1 = Transposition, 2 = Omission, 3 = Duplication
      let strategy = Math.floor(strategyRand * 4);

      // Transposition (swapping two letters) is only beautiful if we have at least 4 letters,
      // otherwise it's better to fallback to Substitution.
      if (chars.length < 4 && strategy === 1) {
        strategy = 0;
      }

      const posRand = mulberry32(wordHash + 200)();

      if (strategy === 1) {
        // Transposition: Swap two adjacent characters in the middle [1, chars.length - 3]
        const pos = 1 + Math.floor(posRand * (chars.length - 3));
        const temp = chars[pos];
        chars[pos] = chars[pos + 1];
        chars[pos + 1] = temp;
        return chars.join('');
      }

      // For other strategies, we choose pos in the middle [1, chars.length - 2]
      const pos = 1 + Math.floor(posRand * (chars.length - 2));
      const charToMutate = chars[pos];

      if (strategy === 0) {
        // Substitution: replace the character with its keyboard neighbor
        const neighbors = russianNeighbors[charToMutate] || englishNeighbors[charToMutate] || '';
        if (neighbors) {
          const neighborRand = mulberry32(wordHash + 300)();
          const neighborsArray = Array.from(neighbors);
          const typo = neighborsArray[Math.floor(neighborRand * neighborsArray.length)];
          chars[pos] = typo;
          return chars.join('');
        } else {
          // Fallback to duplication if no neighbors are known
          chars.splice(pos, 0, charToMutate);
          return chars.join('');
        }
      } else if (strategy === 2) {
        // Omission: remove the character
        chars.splice(pos, 1);
        return chars.join('');
      } else {
        // Duplication: repeat the character
        chars.splice(pos, 0, charToMutate);
        return chars.join('');
      }
    }

    return val;
  });

  return processed.join('');
}

const cyr2latMap: Record<string, string> = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'J',
  'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
  'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j',
  'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
  'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

const lat2cyrMap: Record<string, string> = {
  'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е', 'Yo': 'Ё', 'Zh': 'Ж', 'Z': 'З', 'I': 'И', 'J': 'Й',
  'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф',
  'H': 'Х', 'C': 'Ц', 'Ch': 'Ч', 'Sh': 'Ш', 'Sch': 'Щ', 'Y': 'Ы', 'Yu': 'Ю', 'Ya': 'Я',
  'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е', 'yo': 'ё', 'zh': 'ж', 'z': 'з', 'i': 'и', 'j': 'й',
  'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'f': 'ф',
  'h': 'х', 'c': 'ц', 'ch': 'ч', 'sh': 'ш', 'sch': 'щ', 'y': 'ы', 'yu': 'ю', 'ya': 'я'
};

export function transliterateText(text: string, mode: 'cyr2lat' | 'lat2cyr'): string {
  let result = text;
  if (mode === 'lat2cyr') {
    // Replace multi-char first
    const multiChars = ['Sch', 'sch', 'Zh', 'zh', 'Ch', 'ch', 'Sh', 'sh', 'Yu', 'yu', 'Ya', 'ya', 'Yo', 'yo'];
    for (const mc of multiChars) {
      if (lat2cyrMap[mc]) {
        result = result.split(mc).join(lat2cyrMap[mc]);
      }
    }
    // Then single char, preserving surrogate pairs
    result = Array.from(result).map(char => lat2cyrMap[char] || char).join('');
  } else {
    result = Array.from(result).map(char => cyr2latMap[char] !== undefined ? cyr2latMap[char] : char).join('');
  }
  return result;
}

export function applyStyleToChar(char: string, style?: string): string {
  if (!style || style === 'normal') return char;
  const config = mathFonts[style];
  if (!config) return char;

  const code = char.codePointAt(0);
  if (code === undefined) return char;

  if (code >= 65 && code <= 90) {
    const letters = Array.from(config.latUpper);
    return letters[code - 65] || char;
  }
  if (code >= 97 && code <= 122) {
    const letters = Array.from(config.latLower);
    return letters[code - 97] || char;
  }
  
  if (config.cyrMap[char]) {
    return config.cyrMap[char];
  }

  return char;
}
