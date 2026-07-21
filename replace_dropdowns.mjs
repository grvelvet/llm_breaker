import fs from 'fs';
let code = fs.readFileSync('/tmp/SettingsPanel_final.tsx', 'utf8');

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

const translitRegex = /\{\/\* Выпадающий список: Транслитерация \*\/\}[\s\S]*?(?=\{\/\* Сид воспроизводимости \*\/)/;
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

fs.writeFileSync('/tmp/SettingsPanel_final.tsx', code);
