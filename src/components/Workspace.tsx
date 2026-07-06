import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Clipboard, Check, Trash2, History, ArrowUpRight } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export const Workspace: React.FC = () => {
  const {
    inputText,
    setInputText,
    tokens,
    rawOutputText,
    isHighlightEnabled,
    setIsHighlightEnabled,
    diagnostics,
    addToHistory,
    historyArray,
    restoreHistoryEntry,
  } = useApp();

  const [copied, setCopied] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);

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

  const handleCopyHistoryOutput = async (entry: any) => {
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

  // Dynamic colors for the AI token impact indicator
  let tokenImpactClass = 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
  if (diagnostics.tokenImpact > 50) {
    tokenImpactClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40';
  } else if (diagnostics.tokenImpact > 10) {
    tokenImpactClass = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40';
  }

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
                {inputText.length} символов
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-full p-4 text-sm md:text-base bg-transparent outline-none resize-none text-slate-800 dark:text-slate-100 font-sans focus:ring-0 placeholder-slate-400/80 transition-colors"
              placeholder="Введите текст сюда..."
            />
          </div>
        </div>

        {/* Результат (OutputCard) */}
        <div className={`flex-1 flex-col min-h-[220px] flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden ${isKeyboardOpen ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex justify-between items-center h-12 px-4 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0 gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans select-none">
              Результат
            </span>
            <div className="flex items-center gap-2">
              <span
                id="tokenImpact"
                className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded whitespace-nowrap flex-shrink-0 transition-all duration-300 ${tokenImpactClass}`}
              >
                ИИ-токены: +{diagnostics.tokenImpact}%
              </span>
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
              className={`w-full h-full p-4 text-sm md:text-base bg-transparent overflow-y-auto whitespace-pre-wrap break-words select-all cursor-text text-slate-800 dark:text-slate-100 font-sans leading-relaxed ${
                isHighlightEnabled ? 'show-indicators' : ''
              }`}
            >
              {tokens.length === 0 ? (
                <span className="text-slate-400/80 select-none text-sm">Обфусцированный текст...</span>
              ) : (
                tokens.map((tok, idx) => {
                  if (tok.type === 'replaced') {
                    return (
                      <span
                        key={idx}
                        className={isHighlightEnabled ? 'replaced-node' : ''}
                      >
                        {tok.char}
                      </span>
                    );
                  } else if (tok.type === 'token') {
                     return (
                       <span
                         key={idx}
                         className={isHighlightEnabled ? 'token-break-node' : ''}
                       >
                         {tok.char}
                       </span>
                     );
                  } else {
                    return <React.Fragment key={idx}>{tok.char}</React.Fragment>;
                  }
                })
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
                    className="flex-1 text-left truncate text-xs font-medium text-slate-600 dark:text-slate-350 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-sans cursor-pointer focus:outline-none"
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
