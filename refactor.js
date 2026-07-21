const fs = require('fs');
let code = fs.readFileSync('/tmp/SettingsPanel.tsx', 'utf8');

// 1. We remove applyTargetPlatform('custom') from slider handlers.
code = code.replace(/setRandomSlider\(value\);\s+applyTargetPlatform\('custom'\);/, 'setRandomSlider(value);');
code = code.replace(/setShuffleSlider\(value\);\s+applyTargetPlatform\('custom'\);/, 'setShuffleSlider(value);');
code = code.replace(/setAiSlider\(value\);\s+applyTargetPlatform\('custom'\);/, 'setAiSlider(value);');
code = code.replace(/setClassifierBypass\(value\);\s+applyTargetPlatform\('custom'\);/, 'setClassifierBypass(value);');
code = code.replace(/setBreakTokenizer\(value\);\s+applyTargetPlatform\('custom'\);/, 'setBreakTokenizer(value);');
code = code.replace(/setInjectStrategy\(value as any\);\s+applyTargetPlatform\('custom'\);/, 'setInjectStrategy(value as any);');

// 2. We can add a generic Dropdown component.
const dropdownComponent = `
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
  containerRef: React.RefObject<HTMLDivElement>
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
          <ChevronDown className={\`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 \${isOpen ? 'transform rotate-180' : ''}\`} />
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
                    className={\`px-3.5 py-2.5 text-xs cursor-pointer flex justify-between items-center transition-colors \${
                      isSelected
                        ? 'bg-brand-50/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }\`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{option.label}</div>
                      <div className={\`text-[10px] mt-0.5 truncate leading-relaxed \${isSelected ? 'text-brand-500/70 dark:text-brand-400/60' : 'text-slate-400 dark:text-slate-500'}\`}>
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
`;

code = code.replace('const AccordionSection = ', dropdownComponent + '\nconst AccordionSection = ');

fs.writeFileSync('/tmp/SettingsPanel_new.tsx', code);
