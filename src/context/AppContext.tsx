import React, { createContext, useContext, useState, useEffect } from 'react';
import { HistoryEntry, Diagnostics, ProcessedToken, InjectStrategy, TextStyle } from '../types';
import { obfuscateText, generateSecureKey } from '../utils/engine';

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
  injectStrategy: InjectStrategy;
  setInjectStrategy: (strategy: InjectStrategy) => void;
  textStyle: TextStyle;
  setTextStyle: (style: TextStyle) => void;
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
  const [injectStrategy, setInjectStrategy] = useState<InjectStrategy>('zero-width-spaces');
  const [textStyle, setTextStyle] = useState<TextStyle>('normal');

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
    } catch (e) {
      console.error('Error loading history', e);
    }
    return [];
  });

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
    localStorage.setItem('omoglyph_history_pro', JSON.stringify(historyArray));
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

  // Obfuscation calculations, memoized based on sliders & key inputs
  const { rawOutputText, tokens, diagnostics } = React.useMemo(() => obfuscateText({
    inputText: computedInputText,
    keySalt,
    randomSlider,
    shuffleSlider,
    aiSlider,
    injectStrategy,
    textStyle,
  }), [computedInputText, keySalt, randomSlider, shuffleSlider, aiSlider, injectStrategy, textStyle]);

  const generateNewKey = () => {
    const nextKey = generateSecureKey();
    setKeySalt(nextKey);
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
      injectStrategy,
      textStyle,
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
    setInjectStrategy(entry.injectStrategy);
    setTextStyle(entry.textStyle || 'normal');
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
        injectStrategy,
        setInjectStrategy,
        textStyle,
        setTextStyle,
        isDarkMode,
        setIsDarkMode,
        isHighlightEnabled,
        setIsHighlightEnabled,
        historyArray,
        setHistoryArray,
        rawOutputText,
        tokens,
        diagnostics,
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
