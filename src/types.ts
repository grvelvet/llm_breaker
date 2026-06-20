export type TokenType = 'text' | 'replaced' | 'token';

export type InjectStrategy = 'zero-width-spaces' | 'homoglyph-only' | 'mixed';
export type TextStyle = 'normal' | 'math-bold' | 'math-italic' | 'math-monospace' | 'math-script' | 'math-double-struck';

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
  injectStrategy: InjectStrategy;
  textStyle: TextStyle;
}

export interface Diagnostics {
  replacedCount: number;
  markerCount: number;
  entropyLevel: 'Низкая' | 'Средняя' | 'Максимальная';
  tokenImpact: number;
}

