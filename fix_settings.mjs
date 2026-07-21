import fs from 'fs';
let code = fs.readFileSync('/tmp/SettingsPanel_new.tsx', 'utf8');

const strategyRegex = /\{\/\* Кастомный премиальный выпадающий список: Стратегия \*\/\}[\s\S]*?(?=\{\/\* Слайдер Омоглифов \*\/)/;
const strategyReplacement = `
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
                  containerRef={dropdownRef as any}
                />
                
`;
code = code.replace(strategyRegex, strategyReplacement);

const styleRegex = /\{\/\* Выпадающий список: Стиль символов \*\/\}[\s\S]*?(?=\{\/\* Выпадающий список: Транслитерация \*\/)/;
const styleReplacement = `
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
                  containerRef={styleDropdownRef as any}
                />
                
`;
code = code.replace(styleRegex, styleReplacement);

const translitRegex = /\{\/\* Выпадающий список: Транслитерация \*\/\}[\s\S]*?(?=<\/div>\s*\{\/\* Группа 3: Обход ИИ и Управление \*\/)/;
const translitReplacement = `
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
                  containerRef={translitDropdownRef as any}
                />
              `;
code = code.replace(translitRegex, translitReplacement);

code = code.replace(/ref=\{containerRef as any\}/g, 'ref={containerRef}');
code = code.replace(/containerRef=\{dropdownRef as any\}/g, 'containerRef={dropdownRef}');
code = code.replace(/containerRef=\{styleDropdownRef as any\}/g, 'containerRef={styleDropdownRef}');
code = code.replace(/containerRef=\{translitDropdownRef as any\}/g, 'containerRef={translitDropdownRef}');
code = code.replace(/setInjectStrategy\(value as any\)/g, 'setInjectStrategy(value as any)');


fs.writeFileSync('src/components/SettingsPanel.tsx', code);
