import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HistoryEntry, Diagnostics, ProcessedToken, InjectStrategy, TextStyle, TranslitMode, TargetPlatform, SplitStrategy, SplitStyle } from '../types';
import { generateSecureKey } from '../core';

interface AppContextType {
  inputText: string;
  setInputText: (text: string) => void;
  keySalt: string;
  setKeySalt: (salt: string) => void;
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
  applyTargetPlatform: (platform: TargetPlatform) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isHighlightEnabled: boolean;
  setIsHighlightEnabled: (val: boolean) => void;
  historyArray: HistoryEntry[];
  setHistoryArray: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  
  // Computed values
  rawOutputText: string;
  tokens: ProcessedToken[];
  diagnostics: Diagnostics;
  isGenerating?: boolean;

  // Actions
  generateNewKey: () => void;
  addToHistory: () => void;
  clearHistory: () => void;
  restoreHistoryEntry: (entry: HistoryEntry) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inputText, setInputText] = useState<string>('');
  const [keySalt, setKeySalt] = useState<string>('OMOGLYPH-STABLE-SEED-2026');
  const [randomSlider, setRandomSlider] = useState<number>(80);
  const [shuffleSlider, setShuffleSlider] = useState<number>(0);
  const [aiSlider, setAiSlider] = useState<number>(0);
  const [classifierBypass, setClassifierBypass] = useState<number>(0);
  const [injectStrategy, setInjectStrategy] = useState<InjectStrategy>('zero-width-spaces');
  const [textStyle, setTextStyle] = useState<TextStyle>('normal');
  const [translitMode, setTranslitMode] = useState<TranslitMode>('none');
  const [breakTokenizer, setBreakTokenizer] = useState<boolean>(false);
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>('universal');
  const [payloadSplitting, setPayloadSplitting] = useState<boolean>(false);
  const [splitStrategy, setSplitStrategy] = useState<SplitStrategy>('simple');
  const [splitStyle, setSplitStyle] = useState<SplitStyle>('algebraic');
  const [splitChunkSize, setSplitChunkSize] = useState<number>(3);

  // Dark mode with OS preference compatibility
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('omoglyph_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isHighlightEnabled, setIsHighlightEnabled] = useState<boolean>(true);

  // History with FIFO array maxed to 15 entries
  const [historyArray, setHistoryArray] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('omoglyph_history_pro');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (_e: unknown) { /* ignore */
      console.error('Error loading history', _e);
    }
    return [];
  });


  // Restore settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('omoglyph_settings');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.keySalt) setKeySalt(p.keySalt);
        if (p.randomSlider !== undefined) setRandomSlider(p.randomSlider);
        if (p.shuffleSlider !== undefined) setShuffleSlider(p.shuffleSlider);
        if (p.aiSlider !== undefined) setAiSlider(p.aiSlider);
        if (p.classifierBypass !== undefined) setClassifierBypass(p.classifierBypass);
        if (p.injectStrategy) setInjectStrategy(p.injectStrategy);
        if (p.textStyle) setTextStyle(p.textStyle);
        if (p.translitMode) setTranslitMode(p.translitMode);
        if (p.breakTokenizer !== undefined) setBreakTokenizer(p.breakTokenizer);
        if (p.targetPlatform) setTargetPlatform(p.targetPlatform);
        if (p.payloadSplitting !== undefined) setPayloadSplitting(p.payloadSplitting);
        if (p.splitStrategy) setSplitStrategy(p.splitStrategy);
        if (p.splitStyle) setSplitStyle(p.splitStyle);
        if (p.splitChunkSize !== undefined) setSplitChunkSize(p.splitChunkSize);
      }
    } catch (_e: unknown) { /* ignore */}
  }, []);

  // Save settings on change
  useEffect(() => {
    const settings = {
      keySalt, randomSlider, shuffleSlider, aiSlider, classifierBypass,
      injectStrategy, textStyle, translitMode, breakTokenizer, targetPlatform,
      payloadSplitting, splitStrategy, splitStyle, splitChunkSize
    };
    try {
      localStorage.setItem('omoglyph_settings', JSON.stringify(settings));
    } catch (_e: unknown) { /* ignore */}
  }, [keySalt, randomSlider, shuffleSlider, aiSlider, classifierBypass,
      injectStrategy, textStyle, translitMode, breakTokenizer, targetPlatform,
      payloadSplitting, splitStrategy, splitStyle, splitChunkSize]);

  // Calculate Dark Mode side effect

  useEffect(() => {
    localStorage.setItem('omoglyph_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync history to local storage
  useEffect(() => {
    try {
      localStorage.setItem('omoglyph_history_pro', JSON.stringify(historyArray));
    } catch (err: unknown) {
      const e = err as Error;
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.message?.toLowerCase().includes('quota')) {
        console.warn('LocalStorage quota exceeded, trimming history...');
        toast.error('Превышен лимит памяти, очистка старой истории', { id: 'quota-toast' });
        const shrunkArray = [...historyArray];
        while (shrunkArray.length > 1) {
          shrunkArray.pop();
          try {
            localStorage.setItem('omoglyph_history_pro', JSON.stringify(shrunkArray));
            setHistoryArray(shrunkArray);
            break;
          } catch (_e: unknown) { /* ignore */
            continue;
          }
        }
      } else {
        console.error('Error saving history to local storage', e);
      }
    }
  }, [historyArray]);

  // Dynamic debouncing for large text inputs
  const [computedInputText, setComputedInputText] = useState<string>('');

  useEffect(() => {
    if (inputText.length <= 3000) {
      setComputedInputText(inputText);
    } else {
      const handler = setTimeout(() => {
        setComputedInputText(inputText);
      }, 200);
      return () => clearTimeout(handler);
    }
  }, [inputText]);

  // Obfuscation state
  const [rawOutputText, setRawOutputText] = useState<string>('');
  const [tokens, setTokens] = useState<ProcessedToken[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostics>({
    replacedCount: 0,
    markerCount: 0,
    entropyLevel: 'Низкая',
    tokenImpact: 0,
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (!computedInputText) {
      setRawOutputText('');
      setTokens([]);
      setDiagnostics({
        replacedCount: 0,
        markerCount: 0,
        entropyLevel: 'Низкая',
        tokenImpact: 0,
      });
      return;
    }

    setIsGenerating(true);
    
    // Fallback if workers aren't supported or to avoid Vite worker issues in some environments
    // But in Vite we can just use new Worker(new URL('../workers/obfuscate.worker.ts', import.meta.url), { type: 'module' })
    const worker = new Worker(new URL('../workers/obfuscate.worker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      if (e.data.type === 'SUCCESS') {
        setRawOutputText(e.data.result.rawOutputText);
        setTokens(e.data.result.tokens);
        setDiagnostics(e.data.result.diagnostics);
      } else {
        console.error('Obfuscation error:', e.data.error);
      }
      setIsGenerating(false);
    };

    worker.postMessage({
      inputText: computedInputText,
      keySalt,
      randomSlider,
      shuffleSlider,
      aiSlider,
      classifierBypass,
      injectStrategy,
      textStyle,
      translitMode,
      breakTokenizer,
      payloadSplitting,
      splitStrategy,
      splitStyle,
      splitChunkSize,
    });

    return () => {
      worker.terminate();
    };
  }, [computedInputText, keySalt, randomSlider, shuffleSlider, aiSlider, classifierBypass, injectStrategy, textStyle, translitMode, breakTokenizer, payloadSplitting, splitStrategy, splitStyle, splitChunkSize]);

  const generateNewKey = () => {
    const nextKey = generateSecureKey();
    setKeySalt(nextKey);
  };

  const applyTargetPlatform = (platform: TargetPlatform) => {
    setTargetPlatform(platform);
    if (platform === 'universal') {
      setInjectStrategy('mixed');
      setAiSlider(65);
      setRandomSlider(70);
      setShuffleSlider(15);
      setClassifierBypass(20);
      setBreakTokenizer(false);
    } else if (platform === 'chatgpt') {
      setInjectStrategy('zero-width-spaces');
      setAiSlider(70);
      setRandomSlider(60);
      setShuffleSlider(10);
      setClassifierBypass(25);
      setBreakTokenizer(true);
    } else if (platform === 'claude') {
      setInjectStrategy('homoglyph-only');
      setAiSlider(40);
      setRandomSlider(85);
      setShuffleSlider(20);
      setClassifierBypass(15);
      setBreakTokenizer(false);
    } else if (platform === 'gemini') {
      setInjectStrategy('mixed');
      setAiSlider(90);
      setRandomSlider(50);
      setShuffleSlider(30);
      setClassifierBypass(35);
      setBreakTokenizer(true);
    } else if (platform === 'deepseek') {
      setInjectStrategy('mixed');
      setAiSlider(60);
      setRandomSlider(90);
      setShuffleSlider(5);
      setClassifierBypass(20);
      setBreakTokenizer(true);
    } else if (platform === 'claude_mythos') {
      setInjectStrategy('homoglyph-only');
      setAiSlider(95);
      setRandomSlider(95);
      setShuffleSlider(25);
      setClassifierBypass(40);
      setBreakTokenizer(false);
    } else if (platform === 'gpt_5_5_cyber') {
      setInjectStrategy('mixed');
      setAiSlider(85);
      setRandomSlider(85);
      setShuffleSlider(15);
      setClassifierBypass(30);
      setBreakTokenizer(true);
    } else if (platform === 'qwen' || platform === 'kimi') {
      setInjectStrategy('zero-width-spaces');
      setAiSlider(50);
      setRandomSlider(60);
      setShuffleSlider(0);
      setClassifierBypass(10);
      setBreakTokenizer(false);
    }
  };

  const addToHistory = () => {
    if (!inputText.trim() || !rawOutputText) return;

    // Avoid duplicate insertions of exact same obfuscated output at the front
    if (historyArray.length > 0 && historyArray[0].outputText === rawOutputText) {
      return;
    }

    const newEntry: HistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      inputText,
      outputText: rawOutputText,
      keySalt,
      randomSlider,
      shuffleSlider,
      aiSlider,
      classifierBypass,
      injectStrategy,
      textStyle,
      translitMode,
      breakTokenizer,
      targetPlatform,
      payloadSplitting,
      splitStrategy,
      splitStyle,
      splitChunkSize,
    };

    setHistoryArray((prev) => {
      const updated = [newEntry, ...prev];
      if (updated.length > 15) {
        updated.pop(); // FIFO
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistoryArray([]);
  };

  const restoreHistoryEntry = (entry: HistoryEntry) => {
    setInputText(entry.inputText);
    setKeySalt(entry.keySalt);
    setRandomSlider(entry.randomSlider);
    setShuffleSlider(entry.shuffleSlider);
    setAiSlider(entry.aiSlider);
    setClassifierBypass(entry.classifierBypass || 0);
    setInjectStrategy(entry.injectStrategy);
    setTextStyle(entry.textStyle || 'normal');
    setTranslitMode(entry.translitMode || 'none');
    setBreakTokenizer(entry.breakTokenizer || false);
    setTargetPlatform(entry.targetPlatform || 'universal');
    setPayloadSplitting(entry.payloadSplitting || false);
    setSplitStrategy(entry.splitStrategy || 'simple');
    setSplitStyle(entry.splitStyle || 'algebraic');
    setSplitChunkSize(entry.splitChunkSize || 3);
  };

  return (
    <AppContext.Provider
      value={{
        inputText,
        setInputText,
        keySalt,
        setKeySalt,
        randomSlider,
        setRandomSlider,
        shuffleSlider,
        setShuffleSlider,
        aiSlider,
        setAiSlider,
        classifierBypass,
        setClassifierBypass,
        injectStrategy,
        setInjectStrategy,
        textStyle,
        setTextStyle,
        translitMode,
        setTranslitMode,
        breakTokenizer,
        setBreakTokenizer,
        targetPlatform,
        setTargetPlatform,
        payloadSplitting,
        setPayloadSplitting,
        splitStrategy,
        setSplitStrategy,
        splitStyle,
        setSplitStyle,
        splitChunkSize,
        setSplitChunkSize,
        applyTargetPlatform,
        isDarkMode,
        setIsDarkMode,
        isHighlightEnabled,
        setIsHighlightEnabled,
        historyArray,
        setHistoryArray,
        rawOutputText,
        tokens,
        diagnostics,
        isGenerating,
        generateNewKey,
        addToHistory,
        clearHistory,
        restoreHistoryEntry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
