import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AccordionSection = ({ title, children, isOpen, onToggle }: { title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) => {
  return (
    <div className="flex flex-col border-b border-brand-100/50 dark:border-brand-900/30 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <button 
        type="button" 
        onClick={onToggle}
        className="w-full flex justify-between items-center py-2 focus:outline-none select-none cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">{title}</span>
        <ChevronDown className={`w-4 h-4 text-brand-400/80 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-all ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2 }}
          >
            <div className="pt-4 space-y-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
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
    translitMode,
    setTranslitMode,
    breakTokenizer,
    setBreakTokenizer,
    noiseInstructions,
    setNoiseInstructions,
    customNoiseInstruction,
    setCustomNoiseInstruction,
    diagnostics,
    generateNewKey,
  } = useApp();

  const [activeDropdown, setActiveDropdown] = useState<'strategy' | 'style' | 'translit' | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string>('Базовые параметры');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const translitDropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  // Detect and track mobile vs desktop viewports
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (dropdownRef.current && !dropdownRef.current.contains(target)) &&
        (styleDropdownRef.current && !styleDropdownRef.current.contains(target)) &&
        (translitDropdownRef.current && !translitDropdownRef.current.contains(target))
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close drawer (mobile only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && isMobile) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isMobile]);

  // Lock document scroll on backdrop open (mobile only)
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  // Determine entropy colors
  let entropyColorClass = 'text-red-500';
  if (diagnostics.entropyLevel === 'Максимальная') {
    entropyColorClass = 'text-emerald-500';
  } else if (diagnostics.entropyLevel === 'Средняя') {
    entropyColorClass = 'text-amber-500';
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const drawerVariants = isMobile
    ? {
        hidden: { x: '100%' },
        visible: { x: 0 },
        exit: { x: '100%' },
      }
    : {
        hidden: { opacity: 0, x: 24, scale: 0.98 },
        visible: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: 24, scale: 0.98 },
      };

  const drawerTransition = isMobile
    ? { type: 'spring', damping: 26, stiffness: 220 }
    : { duration: 0.25, ease: 'easeOut' };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BackDrop / Dimmed background with click-away support - Mobile only */}
          {isMobile && (
            <motion.div
              id="settingsBackdrop"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={backdropVariants}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-[2px] z-40 cursor-pointer md:hidden"
            />
          )}

          {/* Sliding Side Drawer layout (mobile) / Integrated page Sidebar (desktop) */}
          <motion.div
            id="settingsDrawer"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerVariants}
            transition={drawerTransition}
            className="fixed inset-y-0 right-0 z-50 h-[100dvh] max-w-sm sm:max-w-md w-full bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800/80 flex flex-col focus:outline-none transition-colors duration-200 safe-pb md:static md:inset-auto md:z-10 md:h-full md:w-72 lg:w-80 md:max-w-none md:border md:rounded-2xl md:flex-shrink-0 md:pb-0"
          >
            {/* Header section */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans select-none">
                Параметры обфускации
              </h2>
              <button
                id="closeModalBtn"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none cursor-pointer md:hidden"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable controls */}
            <div className="flex-1 overflow-y-auto overflow-x-visible md:overflow-visible px-5 py-4 lg:px-6 lg:py-5 space-y-4 pb-6 relative z-10">
              
              <AccordionSection 
                title="Базовые параметры" 
                isOpen={openAccordion === 'Базовые параметры'}
                onToggle={() => setOpenAccordion(openAccordion === 'Базовые параметры' ? '' : 'Базовые параметры')}
              >
                {/* Кастомный премиальный выпадающий список: Стратегия */}
                <div className="space-y-2.5 flex-shrink-0 relative z-30" ref={dropdownRef}>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans select-none block pb-0.5">
                    Метод разделения сигнатур
                  </label>
                  <div className="relative">
                    <button
                      id="injectStrategyBtn"
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'strategy' ? null : 'strategy')}
                      className="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg outline-none text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 cursor-pointer transition-all font-sans font-medium select-none"
                      aria-expanded={activeDropdown === 'strategy'}
                      aria-haspopup="listbox"
                    >
                      <span className="truncate">
                        {injectStrategy === 'zero-width-spaces' && 'Невидимые разделители (ZWS)'}
                        {injectStrategy === 'homoglyph-only' && 'Только омоглифы'}
                        {injectStrategy === 'mixed' && 'Смешанный режим'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${activeDropdown === 'strategy' ? 'transform rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === 'strategy' && (
                        <motion.ul
                          id="injectStrategyListbox"
                          role="listbox"
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 z-50 mt-1.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-xl max-h-60 overflow-y-auto focus:outline-none"
                        >
                          {[
                            { value: 'zero-width-spaces', label: 'Невидимые разделители (ZWS)', desc: 'Скрытые символы нулевой ширины' },
                            { value: 'homoglyph-only', label: 'Только омоглифы', desc: 'Визуально идентичные начертания' },
                            { value: 'mixed', label: 'Смешанный режим', desc: 'Комбинация двух лучших методов' }
                          ].map((option) => {
                            const isSelected = injectStrategy === option.value;
                            return (
                              <li
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setInjectStrategy(option.value as any);
                                  setActiveDropdown(null);
                                }}
                                className={`px-3.5 py-2 text-xs cursor-pointer flex items-start gap-2.5 transition-colors ${
                                  isSelected
                                    ? 'bg-brand-50/55 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold truncate">{option.label}</div>
                                  <div className={`text-[10px] mt-0.5 truncate leading-relaxed ${isSelected ? 'text-brand-500/70 dark:text-brand-400/60' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {option.desc}
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 flex-shrink-0 self-center" />
                                )}
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Слайдер Омоглифов */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium select-none">
                    <span className="text-slate-600 dark:text-slate-300 font-sans">Замена омоглифов</span>
                    <span id="randomVal" className="font-mono text-brand-500 font-bold">{randomSlider}%</span>
                  </div>
                  <input
                    type="range"
                    id="randomSlider"
                    min="0"
                    max="100"
                    value={randomSlider}
                    onChange={(e) => setRandomSlider(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 outline-none"
                  />
                </div>

                {/* Слайдер Перемешивания */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium select-none">
                    <span className="text-slate-600 dark:text-slate-300 font-sans">Перемешивание слов</span>
                    <span id="shuffleVal" className="font-mono text-brand-500 font-bold">{shuffleSlider}%</span>
                  </div>
                  <input
                    type="range"
                    id="shuffleSlider"
                    min="0"
                    max="100"
                    value={shuffleSlider}
                    onChange={(e) => setShuffleSlider(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 outline-none"
                  />
                </div>
              </AccordionSection>

              <AccordionSection 
                title="Визуальные эффекты"
                isOpen={openAccordion === 'Визуальные эффекты'}
                onToggle={() => setOpenAccordion(openAccordion === 'Визуальные эффекты' ? '' : 'Визуальные эффекты')}
              >
                {/* Выпадающий список: Стиль символов */}
                <div className="space-y-2.5 flex-shrink-0 relative z-20" ref={styleDropdownRef}>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans select-none block pb-0.5">
                    Визуальный стиль шрифта
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'style' ? null : 'style')}
                      className="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg outline-none text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 cursor-pointer transition-all font-sans font-medium select-none"
                      aria-expanded={activeDropdown === 'style'}
                      aria-haspopup="listbox"
                    >
                      <span className="truncate">
                        {textStyle === 'normal' && 'Стандартный шрифт'}
                        {textStyle === 'math-bold' && 'Жирный (Math Bold)'}
                        {textStyle === 'math-italic' && 'Курсив (Math Italic)'}
                        {textStyle === 'math-monospace' && 'Моноширинный'}
                        {textStyle === 'math-script' && 'Рукописный (Script)'}
                        {textStyle === 'math-double-struck' && 'Двойной штрих (Double Struck)'}
                        {textStyle === 'math-circled' && 'В кружочках (Circled)'}
                        {textStyle === 'scrambled' && 'Скремблинг (Микс)'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${activeDropdown === 'style' ? 'transform rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === 'style' && (
                        <motion.ul
                          role="listbox"
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 z-50 mt-1.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-xl max-h-60 overflow-y-auto focus:outline-none"
                        >
                          {[
                            { value: 'normal', label: 'Стандартный шрифт', preview: 'Aa', desc: 'Без изменения регистра' },
                            { value: 'math-bold', label: 'Жирный', preview: '𝗔𝗮', desc: 'Mathematical Bold Alphanumeric' },
                            { value: 'math-italic', label: 'Курсив', preview: '𝘈𝘢', desc: 'Mathematical Italic' },
                            { value: 'math-monospace', label: 'Моноширинный', preview: '𝙰𝚊', desc: 'Mathematical Monospace' },
                            { value: 'math-script', label: 'Рукописный', preview: '𝒜𝒶', desc: 'Mathematical Script' },
                            { value: 'math-double-struck', label: 'Двойной штрих', preview: '𝔸𝕒', desc: 'Double-struck / Blackboard' },
                            { value: 'math-circled', label: 'В кружочках', preview: 'Ⓐⓐ', desc: 'Enclosed Alphanumerics' },
                            { value: 'scrambled', label: 'Скремблинг', preview: 'A𝕓𝘤', desc: 'Случайный стиль для букв' }
                          ].map((option) => {
                            const isSelected = textStyle === option.value;
                            return (
                              <li
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setTextStyle(option.value as any);
                                  setActiveDropdown(null);
                                }}
                                className={`px-3.5 py-2 text-xs cursor-pointer flex items-start gap-2.5 transition-colors ${
                                  isSelected
                                    ? 'bg-brand-50/55 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold truncate flex items-center gap-2">
                                    <span className="text-sm font-normal">{option.preview}</span>
                                    {option.label}
                                  </div>
                                  <div className={`text-[10px] mt-0.5 truncate leading-relaxed ${isSelected ? 'text-brand-500/70 dark:text-brand-400/60' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {option.desc}
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 flex-shrink-0 self-center" />
                                )}
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Выпадающий список: Транслитерация */}
                <div className="space-y-2.5 flex-shrink-0 relative z-10" ref={translitDropdownRef}>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans select-none block pb-0.5">
                    Транслитерация текста
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'translit' ? null : 'translit')}
                      className="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg outline-none text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 cursor-pointer transition-all font-sans font-medium select-none"
                      aria-expanded={activeDropdown === 'translit'}
                      aria-haspopup="listbox"
                    >
                      <span className="truncate">
                        {translitMode === 'none' && 'Выключена'}
                        {translitMode === 'cyr2lat' && 'Кириллица -> Латиница'}
                        {translitMode === 'lat2cyr' && 'Латиница -> Кириллица'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${activeDropdown === 'translit' ? 'transform rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === 'translit' && (
                        <motion.ul
                          role="listbox"
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 z-50 mt-1.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-xl max-h-60 overflow-y-auto focus:outline-none"
                        >
                          {[
                            { value: 'none', label: 'Выключена', desc: 'Оригинальный текст' },
                            { value: 'cyr2lat', label: 'Кириллица -> Латиница', desc: 'Конвертация кириллицы в транслит' },
                            { value: 'lat2cyr', label: 'Латиница -> Кириллица', desc: 'Конвертация транслита в кириллицу' }
                          ].map((option) => {
                            const isSelected = translitMode === option.value;
                            return (
                              <li
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setTranslitMode(option.value as any);
                                  setActiveDropdown(null);
                                }}
                                className={`px-3.5 py-2 text-xs cursor-pointer flex items-start gap-2.5 transition-colors ${
                                  isSelected
                                    ? 'bg-brand-50/55 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold truncate">{option.label}</div>
                                  <div className={`text-[10px] mt-0.5 truncate leading-relaxed ${isSelected ? 'text-brand-500/70 dark:text-brand-400/60' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {option.desc}
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 flex-shrink-0 self-center" />
                                )}
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </AccordionSection>

              <AccordionSection 
                title="Продвинутые настройки"
                isOpen={openAccordion === 'Продвинутые настройки'}
                onToggle={() => setOpenAccordion(openAccordion === 'Продвинутые настройки' ? '' : 'Продвинутые настройки')}
              >
                {/* AI Tokenizer Breaking */}
                <div className="space-y-1.5 flex-shrink-0">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans group-hover:text-brand-500 transition-colors">Ломание токенизатора ИИ</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Soft Hyphens, CGJ, подмена пробелов</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={breakTokenizer} 
                        onChange={(e) => setBreakTokenizer(e.target.checked)} 
                      />
                      <div className={`block w-8 h-4.5 rounded-full transition-colors ${breakTokenizer ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      <div className={`dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${breakTokenizer ? 'transform translate-x-3.5' : ''}`}></div>
                    </div>
                  </label>
                </div>

                {/* Noise Instructions */}
                <div className="space-y-1.5 flex-shrink-0">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans group-hover:text-brand-500 transition-colors">Шумовые инструкции</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Внедрение невидимых системных промптов</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={noiseInstructions} 
                        onChange={(e) => setNoiseInstructions(e.target.checked)} 
                      />
                      <div className={`block w-8 h-4.5 rounded-full transition-colors ${noiseInstructions ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      <div className={`dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${noiseInstructions ? 'transform translate-x-3.5' : ''}`}></div>
                    </div>
                  </label>
                  
                  <AnimatePresence>
                    {noiseInstructions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pt-2 overflow-hidden"
                      >
                        <textarea
                          value={customNoiseInstruction}
                          onChange={(e) => setCustomNoiseInstruction(e.target.value)}
                          className="w-full h-20 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none text-slate-700 dark:text-slate-300 transition-all font-mono"
                          placeholder="Ваши скрытые инструкции для ИИ..."
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Слайдер Токенов AI */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium select-none">
                    <span className="text-slate-600 dark:text-slate-300 font-sans">Разрыв токенов</span>
                    <span id="aiVal" className="font-mono text-brand-500 font-bold">{aiSlider}%</span>
                  </div>
                  <input
                    type="range"
                    id="aiSlider"
                    min="0"
                    max="100"
                    value={aiSlider}
                    onChange={(e) => setAiSlider(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 outline-none"
                  />
                </div>

                {/* Соль генерации */}
                <div className="space-y-2 flex-shrink-0">
                  <div className="flex justify-between items-center select-none">
                    <label htmlFor="cryptKey" className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans">
                      Соль / Ключ
                    </label>
                    <button
                      id="generateKeyBtn"
                      onClick={generateNewKey}
                      className="text-[10px] text-brand-500 hover:text-brand-600 font-bold uppercase tracking-wider transition-colors flex items-center gap-1 focus:outline-none cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 animate-none hover:animate-spin" style={{ animationDuration: '2s' }} />
                      Генерация
                    </button>
                  </div>
                  <input
                    type="text"
                    id="cryptKey"
                    value={keySalt}
                    onChange={(e) => setKeySalt(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100 transition-colors"
                  />
                </div>
              </AccordionSection>

            </div>

            {/* Diagnostic stats (sticky/anchored at footer) */}
            <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 font-mono flex-shrink-0 select-none bg-slate-50/50 dark:bg-slate-900/50 relative z-0">
              <div className="flex justify-between">
                <span>Заменено символов:</span>
                <span id="diagReplaced" className="text-slate-700 dark:text-slate-250 font-bold">
                  {diagnostics.replacedCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Внедрено разделителей:</span>
                <span id="diagTokens" className="text-slate-700 dark:text-slate-250 font-bold">
                  {diagnostics.markerCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Общая устойчивость:</span>
                <span id="diagEntropy" className={`font-bold transition-all duration-300 ${entropyColorClass}`}>
                  {diagnostics.entropyLevel}
                </span>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
