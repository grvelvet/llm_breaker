import { create } from 'zustand';
import { HistoryEntry, Diagnostics, ProcessedToken, InjectStrategy, TextStyle, TranslitMode, TargetPlatform, SplitStrategy, SplitStyle } from './types';
import { generateSecureKey, obfuscateText } from './core';
import { parseImagePromptToJSON } from './core/image-prompt-parser';

export interface AppState {
  inputText: string;
  setInputText: (text: string) => void;
  
  keySalt: string;
  setKeySalt: (salt: string) => void;
  generateNewKey: () => void;
  
  randomSlider: number;
  setRandomSlider: (val: number) => void;
  shuffleSlider: number;
  setShuffleSlider: (val: number) => void;
  aiSlider: number;
  setAiSlider: (val: number) => void;
  classifierBypass: number;
  setClassifierBypass: (val: number) => void;
  
  injectStrategy: InjectStrategy;
  setInjectStrategy: (strategy: InjectStrategy) => void;
  textStyle: TextStyle;
  setTextStyle: (style: TextStyle) => void;
  translitMode: TranslitMode;
  setTranslitMode: (mode: TranslitMode) => void;
  breakTokenizer: boolean;
  setBreakTokenizer: (val: boolean) => void;
  targetPlatform: TargetPlatform;
  setTargetPlatform: (platform: TargetPlatform) => void;
  
  payloadSplitting: boolean;
  setPayloadSplitting: (val: boolean) => void;
  splitStrategy: SplitStrategy;
  setSplitStrategy: (val: SplitStrategy) => void;
  splitStyle: SplitStyle;
  setSplitStyle: (val: SplitStyle) => void;
  splitChunkSize: number;
  setSplitChunkSize: (val: number) => void;
  
  jsonImageMode: boolean;
  setJsonImageMode: (val: boolean) => void;

  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  
  applyTargetPlatform: (platform: TargetPlatform) => void;
  
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isHighlightEnabled: boolean;
  setIsHighlightEnabled: (val: boolean) => void;
  
  historyArray: HistoryEntry[];
  setHistoryArray: (arr: HistoryEntry[] | ((prev: HistoryEntry[]) => HistoryEntry[])) => void;
  addToHistory: () => void;
  clearHistory: () => void;
  restoreHistoryEntry: (entry: HistoryEntry) => void;
  
  rawOutputText: string;
  tokens: ProcessedToken[];
  diagnostics: Diagnostics;
  
  // Undo/Redo specific for text
  undoStack: string[];
  redoStack: string[];
  undo: () => void;
  redo: () => void;
}

const loadSettings = () => {
  try {
    const saved = localStorage.getItem('omoglyph_settings_pro');
    if (saved) return JSON.parse(saved);
  } catch (_e) { /* ignore */ }
  return {};
};

const loadHistory = () => {
  try {
    const saved = localStorage.getItem('omoglyph_history_pro');
    if (saved) return JSON.parse(saved);
  } catch (_e) { /* ignore */ }
  return [];
};

const loadDarkMode = () => {
  try {
    const saved = localStorage.getItem('omoglyph_dark_mode');
    if (saved !== null) return saved === 'true';
  } catch (_e) { /* ignore */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const s = loadSettings();

export const useAppStore = create<AppState>((set, get) => ({
  inputText: '',
  undoStack: [],
  redoStack: [],
  
  setInputText: (text: string) => {
    const { inputText, undoStack } = get();
    // Only push to undo stack if the new text is different and avoid recording every single character (we can just push the current text)
    // Actually, a simple approach: just keep 50 states. We might want to debounce this in a real app, but this is fine.
    // To avoid lag, we won't push every single keystroke if it's too much, but let's just do it.
    const newUndo = [...undoStack, inputText].slice(-50);
    set({ inputText: text, undoStack: newUndo, redoStack: [] });
  },
  
  undo: () => {
    const { undoStack, redoStack, inputText } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      inputText: prev,
      undoStack: undoStack.slice(0, -1),
      redoStack: [inputText, ...redoStack].slice(0, 50)
    });
  },
  
  redo: () => {
    const { undoStack, redoStack, inputText } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    set({
      inputText: next,
      undoStack: [...undoStack, inputText].slice(-50),
      redoStack: redoStack.slice(1)
    });
  },

  keySalt: s.keySalt || 'OMOGLYPH-STABLE-SEED-2026',
  setKeySalt: (salt) => set({ keySalt: salt }),
  generateNewKey: () => set({ keySalt: generateSecureKey() }),

  randomSlider: s.randomSlider ?? 80,
  setRandomSlider: (val) => set({ randomSlider: val }),
  shuffleSlider: s.shuffleSlider ?? 0,
  setShuffleSlider: (val) => set({ shuffleSlider: val }),
  aiSlider: s.aiSlider ?? 0,
  setAiSlider: (val) => set({ aiSlider: val }),
  classifierBypass: s.classifierBypass ?? 0,
  setClassifierBypass: (val) => set({ classifierBypass: val }),

  injectStrategy: s.injectStrategy || 'zero-width-spaces',
  setInjectStrategy: (strategy) => set({ injectStrategy: strategy }),
  textStyle: s.textStyle || 'normal',
  setTextStyle: (style) => set({ textStyle: style }),
  translitMode: s.translitMode || 'none',
  setTranslitMode: (mode) => set({ translitMode: mode }),
  breakTokenizer: s.breakTokenizer ?? false,
  setBreakTokenizer: (val) => set({ breakTokenizer: val }),
  targetPlatform: s.targetPlatform || 'universal',
  setTargetPlatform: (platform) => set({ targetPlatform: platform }),

  payloadSplitting: s.payloadSplitting ?? false,
  setPayloadSplitting: (val) => set({ payloadSplitting: val }),
  splitStrategy: s.splitStrategy || 'simple',
  setSplitStrategy: (val) => set({ splitStrategy: val }),
  splitStyle: s.splitStyle || 'algebraic',
  setSplitStyle: (val) => set({ splitStyle: val }),
  splitChunkSize: s.splitChunkSize ?? 3,
  setSplitChunkSize: (val) => set({ splitChunkSize: val }),

  jsonImageMode: s.jsonImageMode ?? false,
  setJsonImageMode: (val) => set({ jsonImageMode: val }),

  isProcessing: false,
  setIsProcessing: (val) => set({ isProcessing: val }),

  applyTargetPlatform: (platform) => {
    const state: Partial<AppState> = { targetPlatform: platform };
    if (platform === 'universal') {
      state.injectStrategy = 'mixed'; state.aiSlider = 65; state.randomSlider = 70;
      state.shuffleSlider = 15; state.classifierBypass = 20; state.breakTokenizer = false;
    } else if (platform === 'chatgpt') {
      state.injectStrategy = 'zero-width-spaces'; state.aiSlider = 70; state.randomSlider = 60;
      state.shuffleSlider = 10; state.classifierBypass = 25; state.breakTokenizer = true;
    } else if (platform === 'claude') {
      state.injectStrategy = 'homoglyph-only'; state.aiSlider = 40; state.randomSlider = 85;
      state.shuffleSlider = 20; state.classifierBypass = 15; state.breakTokenizer = false;
    } else if (platform === 'gemini') {
      state.injectStrategy = 'mixed'; state.aiSlider = 90; state.randomSlider = 50;
      state.shuffleSlider = 30; state.classifierBypass = 35; state.breakTokenizer = true;
    } else if (platform === 'deepseek') {
      state.injectStrategy = 'mixed'; state.aiSlider = 60; state.randomSlider = 90;
      state.shuffleSlider = 5; state.classifierBypass = 20; state.breakTokenizer = true;
    } else if (platform === 'claude_mythos') {
      state.injectStrategy = 'homoglyph-only'; state.aiSlider = 95; state.randomSlider = 95;
      state.shuffleSlider = 25; state.classifierBypass = 40; state.breakTokenizer = false;
    } else if (platform === 'gpt_5_5_cyber') {
      state.injectStrategy = 'mixed'; state.aiSlider = 85; state.randomSlider = 85;
      state.shuffleSlider = 15; state.classifierBypass = 30; state.breakTokenizer = true;
    } else if (platform === 'qwen' || platform === 'kimi') {
      state.injectStrategy = 'zero-width-spaces'; state.aiSlider = 50; state.randomSlider = 60;
      state.shuffleSlider = 0; state.classifierBypass = 10; state.breakTokenizer = false;
    }
    set(state);
  },

  isDarkMode: loadDarkMode(),
  setIsDarkMode: (val) => {
    localStorage.setItem('omoglyph_dark_mode', String(val));
    set({ isDarkMode: val });
  },
  
  isHighlightEnabled: true,
  setIsHighlightEnabled: (val) => set({ isHighlightEnabled: val }),

  historyArray: loadHistory(),
  setHistoryArray: (arr) => {
    if (typeof arr === 'function') {
      const newArr = arr(useAppStore.getState().historyArray);
      localStorage.setItem('omoglyph_history_pro', JSON.stringify(newArr));
      set({ historyArray: newArr });
    } else {
      localStorage.setItem('omoglyph_history_pro', JSON.stringify(arr));
      set({ historyArray: arr });
    }
  },
  addToHistory: () => {
    const {
      inputText, rawOutputText, keySalt, randomSlider, shuffleSlider, aiSlider,
      classifierBypass, injectStrategy, textStyle, translitMode, breakTokenizer,
      targetPlatform, payloadSplitting, splitStrategy, splitStyle, splitChunkSize, jsonImageMode,
      historyArray
    } = get();

    if (!inputText.trim() || !rawOutputText) return;
    if (historyArray.length > 0 && historyArray[0].outputText === rawOutputText) return;

    const newEntry: HistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      inputText, outputText: rawOutputText, keySalt, randomSlider, shuffleSlider, aiSlider,
      classifierBypass, injectStrategy, textStyle, translitMode, breakTokenizer,
      targetPlatform, payloadSplitting, splitStrategy, splitStyle, splitChunkSize, jsonImageMode,
    };

    const updated = [newEntry, ...historyArray].slice(0, 15);
    localStorage.setItem('omoglyph_history_pro', JSON.stringify(updated));
    set({ historyArray: updated });
  },
  
  clearHistory: () => {
    localStorage.setItem('omoglyph_history_pro', JSON.stringify([]));
    set({ historyArray: [] });
  },
  
  restoreHistoryEntry: (entry) => {
    set({
      inputText: entry.inputText, keySalt: entry.keySalt, randomSlider: entry.randomSlider,
      shuffleSlider: entry.shuffleSlider, aiSlider: entry.aiSlider,
      classifierBypass: entry.classifierBypass || 0, injectStrategy: entry.injectStrategy,
      textStyle: entry.textStyle || 'normal', translitMode: entry.translitMode || 'none',
      breakTokenizer: entry.breakTokenizer || false, targetPlatform: entry.targetPlatform || 'universal',
      payloadSplitting: entry.payloadSplitting || false, splitStrategy: entry.splitStrategy || 'simple',
      splitStyle: entry.splitStyle || 'algebraic', splitChunkSize: entry.splitChunkSize || 3,
      jsonImageMode: entry.jsonImageMode || false
    });
  },

  rawOutputText: '',
  tokens: [],
  diagnostics: { replacedCount: 0, markerCount: 0, entropyLevel: 'Низкая', tokenImpact: 0 },
}));

// Subscribe to settings changes to persist them
useAppStore.subscribe((state) => {
  const s = {
    keySalt: state.keySalt, randomSlider: state.randomSlider, shuffleSlider: state.shuffleSlider,
    aiSlider: state.aiSlider, classifierBypass: state.classifierBypass, injectStrategy: state.injectStrategy,
    textStyle: state.textStyle, translitMode: state.translitMode, breakTokenizer: state.breakTokenizer,
    targetPlatform: state.targetPlatform, payloadSplitting: state.payloadSplitting,
    splitStrategy: state.splitStrategy, splitStyle: state.splitStyle, splitChunkSize: state.splitChunkSize,
    jsonImageMode: state.jsonImageMode
  };
  localStorage.setItem('omoglyph_settings_pro', JSON.stringify(s));
});

// Create a debounced effect to calculate obfuscation automatically outside of components
let debounceTimeout: any;
useAppStore.subscribe((state, prevState) => {
  const needsRecompute = (
    state.inputText !== prevState.inputText ||
    state.keySalt !== prevState.keySalt ||
    state.randomSlider !== prevState.randomSlider ||
    state.shuffleSlider !== prevState.shuffleSlider ||
    state.aiSlider !== prevState.aiSlider ||
    state.classifierBypass !== prevState.classifierBypass ||
    state.injectStrategy !== prevState.injectStrategy ||
    state.textStyle !== prevState.textStyle ||
    state.translitMode !== prevState.translitMode ||
    state.breakTokenizer !== prevState.breakTokenizer ||
    state.payloadSplitting !== prevState.payloadSplitting ||
    state.splitStrategy !== prevState.splitStrategy ||
    state.splitStyle !== prevState.splitStyle ||
    state.splitChunkSize !== prevState.splitChunkSize ||
    state.jsonImageMode !== prevState.jsonImageMode
  );

  if (needsRecompute) {
    clearTimeout(debounceTimeout);
    
    if (!state.inputText) {
      useAppStore.setState({
        rawOutputText: '',
        tokens: [],
        diagnostics: { replacedCount: 0, markerCount: 0, entropyLevel: 'Низкая', tokenImpact: 0 }
      });
      return;
    }

    const delay = state.inputText.length > 3000 ? 200 : 0;
    debounceTimeout = setTimeout(async () => {
      try {
        useAppStore.setState({ isProcessing: true });
        let parsedJsonObj = undefined;

        if (state.jsonImageMode && state.inputText.trim()) {
           try {
             // 100% Client-Side Local Parsing for Complete Privacy
             const jsonStr = parseImagePromptToJSON(state.inputText);
             parsedJsonObj = JSON.parse(jsonStr);
           } catch (e) {
             console.error('Local JSON parsing error:', e);
           }
        }

        const result = obfuscateText({
          inputText: state.inputText,
          keySalt: state.keySalt,
          randomSlider: state.randomSlider,
          shuffleSlider: state.shuffleSlider,
          aiSlider: state.aiSlider,
          classifierBypass: state.classifierBypass,
          injectStrategy: state.injectStrategy,
          textStyle: state.textStyle,
          translitMode: state.translitMode,
          breakTokenizer: state.breakTokenizer,
          payloadSplitting: state.payloadSplitting,
          splitStrategy: state.splitStrategy,
          splitStyle: state.splitStyle,
          splitChunkSize: state.splitChunkSize,
          jsonImageMode: state.jsonImageMode,
          parsedJsonObj
        });
        useAppStore.setState({
          rawOutputText: result.rawOutputText,
          tokens: result.tokens,
          diagnostics: result.diagnostics,
          isProcessing: false
        });
      } catch (e) {
        console.error('Obfuscation error:', e);
        useAppStore.setState({ isProcessing: false });
      }
    }, delay);
  }
});
