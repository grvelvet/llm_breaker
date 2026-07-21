import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf8');

const charCountRegex = /\{inputText\.length\} символов/;
code = code.replace(charCountRegex, '{inputText.length} / {rawOutputText.length} символов');

const textAreaRegex = /onChange=\{\(e\) => setInputText\(e\.target\.value\)\}/;
const textAreaReplacement = `onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleCopy();
                }
              }}`;
code = code.replace(textAreaRegex, textAreaReplacement);

fs.writeFileSync('src/components/Workspace.tsx', code);
