import { useAppStore } from '../store';
import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Clipboard, Check, Trash2, History, ArrowUpRight, FileJson } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ProcessedToken, HistoryEntry } from '../types';

function splitTokensByLines(tokens: ProcessedToken[]): ProcessedToken[][] {
  const lines: ProcessedToken[][] = [];
  let currentLine: ProcessedToken[] = [];

  for (const token of tokens) {
    const parts = token.char.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        currentLine.push({ type: token.type, char: parts[i] });
      }
      if (i < parts.length - 1) {
        lines.push(currentLine);
        currentLine = [];
      }
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
}

export const Workspace: React.FC = () => {
  const {
    inputText,
    setInputText,
    tokens,
    rawOutputText,
    isHighlightEnabled,
    setIsHighlightEnabled,
        addToHistory,
    historyArray,
    restoreHistoryEntry,
    jsonImageMode,
    setJsonImageMode,
    isProcessing,
  } = useApp();

  const [copied, setCopied] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);

  const parentRef = useRef<HTMLDivElement>(null);
  const tokenLines = useMemo(() => splitTokensByLines(tokens), [tokens]);

  const rowVirtualizer = useVirtualizer({
    count: tokenLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24, // Estimate 24px height per line
    overscan: 5,
  });

  React.useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        // If the visual viewport height is less than the window's innerHeight by a reasonable amount,
        // it means the virtual keyboard is likely open.
        // We also check for mobile width to avoid hiding sidebars on desktop resizing.
        const isMobile = window.innerWidth < 768;
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        setIsKeyboardOpen(isMobile && keyboardHeight > 100);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCopy = async () => {
    if (!rawOutputText) return;
    const success = await copyToClipboard(rawOutputText);
    if (success) {
      setCopied(true);
      addToHistory();
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } else {
      console.error('Failed to copy text');
    }
  };

  const handleCopyHistoryOutput = async (entry: HistoryEntry) => {
    const success = await copyToClipboard(entry.outputText);
    if (success) {
      setCopiedId(entry.id);
      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } else {
      console.error('Failed to copy text');
    }
  };

  return (
    <div id="appWorkspace" className="w-full flex-1 flex flex-col gap-4 min-h-0 h-full">
      
      <div className="flex-1 flex flex-col gap-4 md:gap-5 min-h-0 overflow-y-auto pb-1 md:pb-0">
        {/* Исходный текст (InputCard) */}
        <div className="flex-1 flex flex-col min-h-[220px] flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center h-12 px-4 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans select-none">
              Исходный текст
            </span>
            <div className="flex items-center gap-2">
              {inputText && (
                <button
                  id="clearInputBtn"
                  onClick={() => setInputText('')}
                  className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all focus:outline-none select-none cursor-pointer"
                  title="Очистить текст"
                  aria-label="Очистить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <span id="charCount" className="text-xs font-mono text-slate-400 dark:text-slate-500 select-none">
                Ввод: {inputText.length} | Вывод: {rawOutputText.length}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
                  e.preventDefault();
                  useAppStore.getState().undo();
                  return;
                }
                if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
                  e.preventDefault();
                  useAppStore.getState().redo();
                  return;
                }
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleCopy();
                }
              }}
              className="w-full h-full p-4 text-sm md:text-base bg-transparent outline-none resize-none text-slate-800 dark:text-slate-100 font-sans focus:ring-0 placeholder-slate-400/80 transition-colors"
              placeholder="Введите текст сюда..."
            />
          </div>
        </div>

        {/* Результат (OutputCard) */}
        <div className={`flex-1 flex-col min-h-[220px] flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden ${isKeyboardOpen ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex justify-between items-center h-12 px-4 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0 gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans select-none flex items-center gap-2">
              Результат
              {isProcessing && (
                <div className="flex space-x-1 items-center ml-1">
                  <div className="w-1 h-1 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-brand-500 rounded-full animate-bounce"></div>
                </div>
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setJsonImageMode(!jsonImageMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all select-none cursor-pointer border ${
                  jsonImageMode
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
                title="Переключить автоматический разбор промта в JSON для генераторов картинок"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>JSON Промт</span>
              </button>

              <button
                id="toggleView"
                onClick={() => setIsHighlightEnabled(!isHighlightEnabled)}
                disabled={!rawOutputText}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
                title={isHighlightEnabled ? "Выключить подсветку" : "Включить подсветку"}
                aria-label="Переключить видимость подсветки"
              >
                {isHighlightEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <div
              id="outputText"
              ref={parentRef}
              className={`w-full h-full p-4 text-sm md:text-base bg-transparent overflow-y-auto whitespace-pre-wrap break-words select-all cursor-text text-slate-800 dark:text-slate-100 font-sans leading-relaxed ${
                isHighlightEnabled ? 'show-indicators' : ''
              }`}
            >
              {tokens.length === 0 ? (
                <span className="text-slate-400/80 select-none text-sm">Обфусцированный текст...</span>
              ) : !isHighlightEnabled ? (
                rawOutputText
              ) : (
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const lineTokens = tokenLines[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.index}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        {lineTokens.map((tok: ProcessedToken, idx: number) => {
                          if (tok.type === 'replaced') {
                            return (
                              <span key={idx} className="replaced-node">
                                {tok.char}
                              </span>
                            );
                          } else if (tok.type === 'token') {
                            return (
                              <span key={idx} className="token-break-node">
                                {tok.char}
                              </span>
                            );
                          } else {
                            return <React.Fragment key={idx}>{tok.char}</React.Fragment>;
                          }
                        })}
                        {/* Always append a newline since we split by it, except maybe the last line, but pre-wrap needs it to keep line height if empty */}
                        {virtualRow.index < tokenLines.length - 1 ? '\n' : ''}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Интегрированная панель подвала с кнопкой Копировать */}
          <div className="px-4 pb-4 flex justify-end flex-shrink-0">
            <button
              id="copyBtn"
              onClick={handleCopy}
              disabled={!rawOutputText}
              className={`p-2.5 rounded-xl text-white font-bold transition-all duration-300 focus:outline-none active:scale-[0.95] select-none cursor-pointer ${
                copied
                  ? 'bg-emerald-600 dark:bg-emerald-650 shadow-md shadow-emerald-500/20'
                  : 'bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-md shadow-brand-500/15 hover:shadow-brand-500/25 disabled:opacity-40 disabled:shadow-none disabled:pointer-events-none'
              }`}
              title={copied ? "Скопировано!" : "Копировать результат"}
              aria-label="Копировать результат"
            >
              {copied ? (
                <Check className="w-5 h-5 animate-scale-up" />
              ) : (
                <Clipboard className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Панель недавних записей кумулятивно под карточками */}
      {historyArray && historyArray.length > 0 && (
        <div className="hidden md:flex bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 flex-shrink-0 flex-col gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none transition-shadow duration-300">
          <div className="flex items-center gap-1.5 pb-0.5 select-none">
            <History className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">
              История обработанного текста
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 overflow-y-auto max-h-24">
            {historyArray.slice(0, 3).map((entry) => {
              const isEntryCopied = copiedId === entry.id;
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/45 rounded-xl transition-colors border border-slate-100 dark:border-slate-800/60"
                >
                  <button
                    onClick={() => restoreHistoryEntry(entry)}
                    className="flex-1 text-left line-clamp-2 break-words text-xs font-medium text-slate-600 dark:text-slate-350 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-sans cursor-pointer focus:outline-none"
                    title="Восстановить этот текст"
                  >
                    {entry.inputText}
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleCopyHistoryOutput(entry)}
                      className={`p-1 rounded-lg transition-all focus:outline-none cursor-pointer ${
                        isEntryCopied
                          ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                          : 'text-slate-400 dark:text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                      }`}
                      title="Скопировать скрытый результат"
                      aria-label="Скопировать"
                    >
                      {isEntryCopied ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Clipboard className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => restoreHistoryEntry(entry)}
                      className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
                      title="Заполнить"
                      aria-label="Восстановить"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
