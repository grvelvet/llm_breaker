import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, RefreshCw, ChevronDown, Check, Globe, Sliders, Shield, Terminal, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom brand logos for the platforms to look extremely authentic and high-quality
const ChatGPTLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.7 11.2c-.2-1.2-1-2.2-2.2-2.5 0-.2.1-.4.1-.7 0-1.7-1.4-3-3-3-.4 0-.8.1-1.1.2C14.8 4 13.5 3.3 12 3.3c-1.5 0-2.8.7-3.5 1.9-.3-.1-.7-.2-1.1-.2-1.7 0-3 1.4-3 3 0 .2 0 .4.1.7-1.2.3-2 1.3-2.2 2.5-.2.6-.2 1.2 0 1.8.2 1.2 1 2.2 2.2 2.5 0 .2-.1.4-.1.7 0 1.7 1.4 3 3 3 .4 0 .8-.1 1.1-.2.7 1.2 2 1.9 3.5 1.9 1.5 0 2.8-.7 3.5-1.9.3.1.7.2 1.1.2 1.7 0 3-1.4 3-3 0-.2 0-.4-.1-.7 1.2-.3 2-1.3 2.2-2.5.2-.6.2-1.2 0-1.8zm-9.7 7.5c-1 0-1.9-.5-2.4-1.3l2.4-1.4 2.4 1.4c-.5.8-1.4 1.3-2.4 1.3zm-5-1.5c-.6 0-1.1-.3-1.4-.8.1 0 .1 0 .2-.1l4.1-2.4v2.8l-2.9 1.5zm-1.8-3.4c-.3-.5-.4-1.1-.4-1.6.1 0 .1 0 .2.1l4.1 2.4v-2.8l-3.9-1.9v3.8zm1-5.1c0-.6.3-1.1.8-1.4v4.9l-2.4-1.4c-.1.1-.1.2-.1.3l1.7-2.4zm4.1-1.2c1 0 1.9.5 2.4 1.3l-2.4 1.4-2.4-1.4c.5-.8 1.4-1.3 2.4-1.3zm5 1.5c.6 0 1.1.3 1.4.8l-4.3 2.5V9.4l2.9-1.6zm1.8 3.4c.3.5.4 1.1.4 1.6l-4.3-2.5v2.8l3.9 2.2V12.4zm-1 5.1c0 .6-.3 1.1-.8 1.4v-4.9l2.4 1.4c.1-.1.1-.2.1-.3l-1.7 2.4z" />
  </svg>
);

const ClaudeLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5v3.25l2.25-2.25a1.5 1.5 0 1 1 2.12 2.12l-2.25 2.25H19a1.5 1.5 0 1 1 0 3h-3.38l2.25 2.25a1.5 1.5 0 1 1-2.12 2.12L13.5 14.88V19a1.5 1.5 0 1 1-3 0v-4.12l-2.25 2.25a1.5 1.5 0 1 1-2.12-2.12l2.25-2.25H5a1.5 1.5 0 1 1 0-3h3.38L6.13 7.62a1.5 1.5 0 1 1 2.12-2.12l2.25 2.25V3.5A1.5 1.5 0 0 1 12 2z" />
  </svg>
);

const GeminiLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M10 2c0 4.418-3.582 8-8 8 4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z" />
    <path d="M19 3c0 1.657-1.343 3-3 3 1.657 0 3 1.343 3 3 0-1.657 1.343-3 3-3-1.657 0-3-1.343-3-3z" />
  </svg>
);

const DeepSeekLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 4h7a8 8 0 0 1 8 8 8 8 0 0 1-8 8H4V4zm4 4v8h3a4 4 0 0 0 4-4 4 4 0 0 0-4-4H8z" />
    <path d="M9 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" opacity="0.3" />
  </svg>
);


const Dropdown = ({ 
  label, 
  value, 
  options, 
  onChange, 
  isOpen, 
  onToggle, 
  containerRef 
}: { 
  label: string, 
  value: string, 
  options: {value: string, label: string, desc: string}[], 
  onChange: (val: string) => void,
  isOpen: boolean,
  onToggle: () => void,
  containerRef: React.RefObject<HTMLDivElement | null>
}) => {
  const selectedOption = options.find(o => o.value === value) || options[0];
  return (
    <div className="space-y-2.5 flex-shrink-0 relative z-30" ref={containerRef}>
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans select-none block pb-0.5">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg outline-none text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 cursor-pointer transition-all font-sans font-medium select-none"
        >
          <span className="truncate">{selectedOption.label}</span>
          <ChevronDown className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 z-50 mt-1.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-xl max-h-60 overflow-y-auto focus:outline-none"
            >
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <li
                    key={option.value}
                    onClick={() => { onChange(option.value); onToggle(); }}
                    className={`px-3.5 py-2.5 text-xs cursor-pointer flex justify-between items-center transition-colors ${
                      isSelected
                        ? 'bg-brand-50/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
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
  );
};

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
    applyTargetPlatform,
    payloadSplitting,
    setPayloadSplitting,
    splitStrategy,
    setSplitStrategy,
    splitStyle,
    setSplitStyle,
    splitChunkSize,
    setSplitChunkSize,
    diagnostics,
    generateNewKey,
  } = useApp();

  const [activeDropdown, setActiveDropdown] = useState<'platform' | 'strategy' | 'style' | 'translit' | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string>('Целевая платформа');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const translitDropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  const handleInjectStrategyChange = (value: string) => {
    setInjectStrategy(value as any);
  };

  const handleRandomSliderChange = (value: number) => {
    setRandomSlider(value);
  };

  const handleShuffleSliderChange = (value: number) => {
    setShuffleSlider(value);
  };

  const handleAiSliderChange = (value: number) => {
    setAiSlider(value);
  };

  const handleClassifierBypassChange = (value: number) => {
    setClassifierBypass(value);
  };

  const handleBreakTokenizerChange = (value: boolean) => {
    setBreakTokenizer(value);
  };

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
        (platformDropdownRef.current && !platformDropdownRef.current.contains(target)) &&
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
    ? { type: 'spring' as const, damping: 26, stiffness: 220 }
    : { duration: 0.25, ease: 'easeOut' as const };

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
            <div className="flex-1 overflow-y-auto px-5 py-4 lg:px-6 lg:py-5 space-y-4 pb-6 relative z-10">
              
              <AccordionSection 
                title="Целевая платформа" 
                isOpen={openAccordion === 'Целевая платформа'}
                onToggle={() => setOpenAccordion(openAccordion === 'Целевая платформа' ? '' : 'Целевая платформа')}
              >
                <div className="space-y-1.5 flex-shrink-0">
                  <ul className="flex flex-col gap-1.5" role="listbox">
                    {[
                      { value: 'universal', label: 'Универсальная', desc: 'Базовый пресет для большинства платформ', icon: Globe },
                      { value: 'chatgpt', label: 'ChatGPT', desc: 'Оптимизировано для алгоритмов OpenAI', icon: ChatGPTLogo },
                      { value: 'claude', label: 'Claude', desc: 'Специально для Anthropic', icon: ClaudeLogo },
                      { value: 'gemini', label: 'Gemini', desc: 'Устойчивость к токенизатору Google', icon: GeminiLogo },
                      { value: 'deepseek', label: 'DeepSeek', desc: 'Сбалансированные параметры', icon: DeepSeekLogo },
                      { value: 'claude_mythos', label: 'Claude Mythos', desc: 'Вайб-хакинг, защита и обход (Mythos)', icon: Ghost },
                      { value: 'gpt_5_5_cyber', label: 'GPT-5.5-Cyber', desc: 'Автономный режим аудита безопасности', icon: Terminal },
                      { value: 'qwen', label: 'Qwen / Kimi', desc: 'Локальные нецензурируемые модели', icon: Shield },
                      { value: 'custom', label: 'Пользовательская', desc: 'Настроить вручную', icon: Sliders }
                    ].map((option) => {
                      const isSelected = targetPlatform === option.value;
                      const PlatformIcon = option.icon;
                      return (
                        <li
                          key={option.value}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => applyTargetPlatform(option.value as any)}
                          className={`px-3.5 py-2 text-xs cursor-pointer flex items-start gap-2.5 transition-colors rounded-lg border ${
                            isSelected
                              ? 'bg-brand-50/55 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium border-brand-500/30'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
                          }`}
                        >
                          {PlatformIcon && (
                            <PlatformIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              isSelected ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                            }`} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{option.label}</div>
                            <div className={`text-[10px] mt-0.5 truncate leading-relaxed ${isSelected ? 'text-brand-500/70 dark:text-brand-400/60' : 'text-slate-400 dark:text-slate-500'}`}>
                              {option.desc}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0 self-center" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

              </AccordionSection>

              <AccordionSection 
                title="Тонкие настройки" 
                isOpen={openAccordion === 'Тонкие настройки'}
                onToggle={() => setOpenAccordion(openAccordion === 'Тонкие настройки' ? '' : 'Тонкие настройки')}
              >
                {/* Группа 1: Сигнатуры и Опечатки */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                    Сигнатуры и Опечатки
                  </h4>

                  
                <Dropdown
                  label="Метод разделения сигнатур"
                  value={injectStrategy}
                  options={[
                    { value: 'zero-width-spaces', label: 'Невидимые разделители (ZWS)', desc: 'Скрытые символы нулевой ширины' },
                    { value: 'homoglyph-only', label: 'Только омоглифы', desc: 'Визуально идентичные начертания' },
                    { value: 'mixed', label: 'Смешанный режим', desc: 'Комбинация двух лучших методов' }
                  ]}
                  onChange={handleInjectStrategyChange}
                  isOpen={activeDropdown === 'strategy'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'strategy' ? null : 'strategy')}
                  containerRef={dropdownRef}
                />
                
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
                    onChange={(e) => handleRandomSliderChange(Number(e.target.value))}
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
                    onChange={(e) => handleShuffleSliderChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 outline-none"
                  />
                </div>

                {/* Слайдер Обхода классификаторов */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium select-none">
                    <span className="text-slate-600 dark:text-slate-300 font-sans">Обход классификаторов (опечатки)</span>
                    <span id="classifierVal" className="font-mono text-brand-500 font-bold">{classifierBypass}%</span>
                  </div>
                  <input
                    type="range"
                    id="classifierBypass"
                    min="0"
                    max="100"
                    value={classifierBypass}
                    onChange={(e) => handleClassifierBypassChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Группа 2: Стилизация и Транслитерация */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  Стилизация текста
                </h4>

                
                <Dropdown
                  label="Визуальный стиль шрифта"
                  value={textStyle}
                  options={[
                    { value: 'normal', label: 'Обычный текст', desc: 'Стандартные символы (без стилизации)' },
                    { value: 'math-bold', label: 'Математический Bold', desc: 'Жирный шрифт Юникода' },
                    { value: 'math-italic', label: 'Математический Italic', desc: 'Курсивный шрифт Юникода' },
                    { value: 'math-monospace', label: 'Математический Monospace', desc: 'Моноширинный шрифт Юникода' },
                    { value: 'math-script', label: 'Математический Script', desc: 'Рукописный шрифт Юникода' },
                    { value: 'math-double-struck', label: 'Математический Double Struck', desc: 'Двойное начертание' },
                    { value: 'math-circled', label: 'Математический Circled', desc: 'Символы в кружочках' },
                    { value: 'scrambled', label: 'Скремблинг', desc: 'Случайный стиль для букв' }
                  ]}
                  onChange={(v) => setTextStyle(v as any)}
                  isOpen={activeDropdown === 'style'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'style' ? null : 'style')}
                  containerRef={styleDropdownRef}
                />
                

                <Dropdown
                  label="Транслитерация текста"
                  value={translitMode}
                  options={[
                    { value: 'none', label: 'Выключена', desc: 'Оригинальный текст' },
                    { value: 'cyr2lat', label: 'Кириллица → Латиница', desc: 'Замена кириллических букв на латинские омоглифы' },
                    { value: 'lat2cyr', label: 'Латиница → Кириллица', desc: 'Замена латинских букв на кириллические омоглифы' }
                  ]}
                  onChange={(v) => setTranslitMode(v as any)}
                  isOpen={activeDropdown === 'translit'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'translit' ? null : 'translit')}
                  containerRef={translitDropdownRef}
                />
              </div>

              {/* Группа 3: Обход ИИ и Управление */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  Обход ИИ и Управление
                </h4>

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
                        onChange={(e) => handleBreakTokenizerChange(e.target.checked)} 
                      />
                      <div className={`block w-8 h-4.5 rounded-full transition-colors ${breakTokenizer ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      <div className={`dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${breakTokenizer ? 'transform translate-x-3.5' : ''}`}></div>
                    </div>
                  </label>
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
                    onChange={(e) => handleAiSliderChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 outline-none"
                  />
                </div>

                {/* Сид воспроизводимости */}
                <div className="space-y-2 flex-shrink-0">
                  <div className="flex justify-between items-center select-none">
                    <label htmlFor="cryptKey" className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans">
                      Сид воспроизводимости
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
              </div>
            </AccordionSection>

            <AccordionSection 
              title="Фрагментация" 
              isOpen={openAccordion === 'Фрагментация'}
              onToggle={() => setOpenAccordion(openAccordion === 'Фрагментация' ? '' : 'Фрагментация')}
            >
              <div className="space-y-4">
                <div className="space-y-1.5 flex-shrink-0">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans group-hover:text-brand-500 transition-colors">Включить фрагментацию</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Разбивает промпт на конкатенируемые переменные</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={payloadSplitting} 
                        onChange={(e) => {
                          setPayloadSplitting(e.target.checked);
                          if (e.target.checked) applyTargetPlatform('custom');
                        }} 
                      />
                      <div className={`block w-8 h-4.5 rounded-full transition-colors ${payloadSplitting ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      <div className={`dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${payloadSplitting ? 'transform translate-x-3.5' : ''}`}></div>
                    </div>
                  </label>

                  <AnimatePresence>
                    {payloadSplitting && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pt-2 pb-1 space-y-3 overflow-hidden border-t border-slate-100 dark:border-slate-800/50 mt-2"
                      >
                        {/* Strategy selection */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">
                            Метод именования и порядка
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'simple', label: 'Простой' },
                              { id: 'shuffled', label: 'Перемешан' },
                              { id: 'obfuscated', label: 'Обфусцир.' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  setSplitStrategy(opt.id as any);
                                  applyTargetPlatform('custom');
                                }}
                                className={`py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all focus:outline-none ${
                                  splitStrategy === opt.id
                                    ? 'bg-brand-500/10 border-brand-500/50 text-brand-600 dark:text-brand-400 dark:bg-brand-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Reconstruction style selection */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">
                            Формат сборки и сборщик
                          </span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'algebraic', label: 'Алгебра' },
                              { id: 'python', label: 'Python' },
                              { id: 'javascript', label: 'JS' },
                              { id: 'implicit', label: 'Промпт' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  setSplitStyle(opt.id as any);
                                  applyTargetPlatform('custom');
                                }}
                                className={`py-1.5 px-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all focus:outline-none ${
                                  splitStyle === opt.id
                                    ? 'bg-brand-500/10 border-brand-500/50 text-brand-600 dark:text-brand-400 dark:bg-brand-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Chunk Size Slider */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between items-center text-xs font-medium select-none">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">
                              Размер фрагмента (слов)
                            </span>
                            <span className="font-mono text-brand-500 font-bold bg-brand-500/10 px-1.5 py-0.5 rounded">
                              {splitChunkSize}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={splitChunkSize}
                            onChange={(e) => {
                              setSplitChunkSize(Number(e.target.value));
                              applyTargetPlatform('custom');
                            }}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </AccordionSection>

            </div>

            {/* Diagnostic stats (sticky/anchored at footer) */}
            <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 font-mono flex-shrink-0 select-none bg-slate-50/50 dark:bg-slate-900/50 relative z-0">
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
