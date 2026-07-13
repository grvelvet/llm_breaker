export type TokenType = 'text' | 'replaced' | 'token';

export type InjectStrategy = 'zero-width-spaces' | 'homoglyph-only' | 'mixed';
export type TextStyle = 'normal' | 'math-bold' | 'math-italic' | 'math-monospace' | 'math-script' | 'math-double-struck' | 'math-circled' | 'scrambled';
export type TranslitMode = 'none' | 'cyr2lat' | 'lat2cyr';
export type TargetPlatform = 'universal' | 'chatgpt' | 'claude' | 'gemini' | 'deepseek' | 'claude_mythos' | 'gpt_5_5_cyber' | 'qwen' | 'kimi' | 'custom';

export interface ProcessedToken {
  type: TokenType;
  char: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  inputText: string;
  outputText: string;
  keySalt: string;
  randomSlider: number;
  shuffleSlider: number;
  aiSlider: number;
  classifierBypass?: number;
  injectStrategy: InjectStrategy;
  textStyle: TextStyle;
  translitMode: TranslitMode;
  breakTokenizer?: boolean;
  targetPlatform?: TargetPlatform;
  payloadSplitting?: boolean;
}

export interface Diagnostics {
  replacedCount: number;
  markerCount: number;
  entropyLevel: 'Низкая' | 'Средняя' | 'Максимальная';
  tokenImpact: number;
}

