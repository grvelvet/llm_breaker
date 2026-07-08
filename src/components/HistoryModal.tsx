import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { HistoryEntry } from '../types';
import { X, Download, Upload, Trash2, History, Clipboard, Check, Eye } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const {
    historyArray,
    setHistoryArray,
    clearHistory,
    restoreHistoryEntry,
  } = useApp();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.hasAttribute('open')) {
        dialog.showModal();
      }
    } else {
      if (dialog.hasAttribute('open')) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      onClose();
    }
  };

  // Export history list into a local JSON file download link
  const handleExport = () => {
    if (historyArray.length === 0) return;
    const blob = new Blob([JSON.stringify(historyArray, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omoglyph_history_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerImportFile = () => {
    fileInputRef.current?.click();
  };

  // Safe validation and loading schema
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const textStr = evt.target?.result as string;
        if (!textStr) return;

        const parsed = JSON.parse(textStr);
        if (!Array.isArray(parsed)) {
          alert('Недопустимый формат файла. Должен быть массив JSON.');
          return;
        }

        // Validate structure safely
        const validated: HistoryEntry[] = parsed.filter((item): item is HistoryEntry => {
          return (
            item &&
            typeof item === 'object' &&
            typeof item.inputText === 'string' &&
            typeof item.outputText === 'string' &&
            typeof item.keySalt === 'string' &&
            typeof item.randomSlider === 'number' &&
            typeof item.shuffleSlider === 'number' &&
            typeof item.aiSlider === 'number' &&
            (item.injectStrategy === 'zero-width-spaces' ||
              item.injectStrategy === 'homoglyph-only' ||
              item.injectStrategy === 'mixed')
          );
        }).map(item => ({
          ...item,
          id: item.id || Math.random().toString(36).substring(2, 9),
          timestamp: item.timestamp || Date.now(),
        }));

        if (validated.length === 0) {
          alert('Файл истории не содержит корректных записей обфускации.');
          return;
        }

        // FIFO - max 15 combined entries
        setHistoryArray((prev) => {
          const combined = [...validated, ...prev];
          return combined.slice(0, 15);
        });
      } catch (err) {
        console.error('Failed to parse history JSON', err);
        alert('Ошибка при чтении или анализе структуры JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input target so uploading same file twice triggers change handler
  };

  const handleQuickCopy = async (entry: HistoryEntry) => {
    const success = await copyToClipboard(entry.outputText);
    if (success) {
      setCopiedId(entry.id);
      setTimeout(() => {
        setCopiedId(null);
      }, 1200);
    } else {
      console.error('Failed to copy');
    }
  };

  const handleRestore = (entry: HistoryEntry) => {
    restoreHistoryEntry(entry);
    onClose();
  };

  return (
    <dialog
      id="historyModal"
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="w-[calc(100%-2rem)] max-w-xl rounded-2xl p-4 sm:p-6 focus:outline-none bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 shadow-2xl transition-all"
    >
      <div className="flex flex-col h-full max-h-[75vh] w-full gap-4">
        
        {/* Заголовок истории */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850 flex-shrink-0 select-none">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
              История генераций
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors focus:outline-none"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Системные действия с файлами истории */}
        <div className="flex items-center justify-between gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800/60 flex-shrink-0 text-xs select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={historyArray.length === 0}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-brand-500 font-semibold transition-colors focus:outline-none disabled:opacity-40 disabled:hover:text-slate-600"
            >
              <Download className="w-4 h-4" />
              Экспорт (JSON)
            </button>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <button
              onClick={triggerImportFile}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-brand-500 font-semibold transition-colors focus:outline-none"
            >
              <Upload className="w-4 h-4" />
              Импорт (JSON)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
              accept=".json"
            />
          </div>
          <button
            onClick={clearHistory}
            disabled={historyArray.length === 0}
            className="text-red-500 hover:text-red-600 font-bold transition-colors focus:outline-none disabled:opacity-40 disabled:hover:text-red-550"
          >
            Очистить всё
          </button>
        </div>

        {/* Контейнер для списка */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          {historyArray.length === 0 ? (
            <div id="historyEmptyState" className="flex flex-col items-center justify-center py-12 text-slate-450 dark:text-slate-550 gap-2 select-none">
              <History className="w-12 h-12 stroke-[1.2] text-slate-300 dark:text-slate-700" />
              <span className="text-xs font-sans">История генераций пуста</span>
            </div>
          ) : (
            <ul id="historyList" className="space-y-3">
              {historyArray.map((entry) => {
                const isCopied = copiedId === entry.id;
                return (
                  <li
                    key={entry.id}
                    className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs transition-colors hover:border-slate-200/80 dark:hover:border-slate-700/80"
                  >
                    {/* Левый информационный блок */}
                    <div className="space-y-1 flex-1 min-h-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-700 font-mono">|</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-3 whitespace-pre-wrap break-words pr-2 font-sans">
                        {entry.inputText}
                      </p>

                      <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                        <span className="px-1.5 py-0.5 bg-slate-105 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                          Ключ: {entry.keySalt.substring(0, 12)}
                          {entry.keySalt.length > 12 ? '...' : ''}
                        </span>
                        <span className="px-1.5 py-0.5 bg-brand-100/60 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 rounded">
                          Омоглифы: {entry.randomSlider}%
                        </span>
                        {entry.shuffleSlider > 0 && (
                          <span className="px-1.5 py-0.5 bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded">
                            Шафл: {entry.shuffleSlider}%
                          </span>
                        )}
                        {entry.aiSlider > 0 && (
                          <span className="px-1.5 py-0.5 bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 rounded">
                            Разрыв: {entry.aiSlider}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Правый блок кнопок быстрого действия */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 select-none">
                      {/* Кнопка Быстрое Копирование */}
                      <button
                        onClick={() => handleQuickCopy(entry)}
                        className={`px-3 py-1.5 font-bold rounded transition-colors text-[10px] flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-brand-500/20 ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-170 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/20 dark:border-slate-800/20 shadow-sm'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            Готово!
                          </>
                        ) : (
                          <>
                            <Clipboard className="w-3 h-3" />
                            Копировать
                          </>
                        )}
                      </button>

                      {/* Кнопка Восстановить в редакторе */}
                      <button
                        onClick={() => handleRestore(entry)}
                        className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded transition-colors text-[10px] focus:outline-none shadow-sm focus:ring-1 focus:ring-brand-500/20 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Восстановить
                      </button>

                      {/* Удалить запись */}
                      <button
                        onClick={() => {
                          setHistoryArray((prev) => prev.filter((item) => item.id !== entry.id));
                        }}
                        className="p-1.5 text-slate-450 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
                        title="Удалить запись"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </dialog>
  );
};
