const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Refactor App.svelte
let appSveltePath = path.join(srcDir, 'App.svelte');
let appCode = fs.readFileSync(appSveltePath, 'utf8');

appCode = appCode.replace(/stepErrors = getStepErrors\(false\);/g, 'stepErrors = getStepErrors();');
appCode = appCode.replace(/function getStepErrors\(showUI = true\) \{/g, 'function getStepErrors() {');

const blocks = ['formatBlock', 'personalDataBlock', 'transportBlock', 'provisionsBlock', 'accommodationBlock', 'freeMicBlock'];
for (let b of blocks) {
    appCode = appCode.replace(new RegExp(`errors = ${b}\\.validate\\(showUI\\);`, 'g'), `errors = ${b}.validate();`);
}
fs.writeFileSync(appSveltePath, appCode);

// 2. Refactor all Blocks
const blocksDir = path.join(srcDir, 'blocks');
const blockFiles = fs.readdirSync(blocksDir).filter(f => f.endsWith('Block.svelte'));

for (let file of blockFiles) {
    let p = path.join(blocksDir, file);
    let code = fs.readFileSync(p, 'utf8');
    
    code = code.replace(/export function validate\(showUI = true\) \{/g, 'export function validate() {');
    code = code.replace(/\.validate\(showUI\)/g, '.validate()');
    
    fs.writeFileSync(p, code);
}

// 3. Refactor all Inputs
const componentsDir = path.join(srcDir, 'components');
const inputFiles = ['TextInput.svelte', 'SelectInput.svelte', 'RadioGroup.svelte', 'PeriodsGrid.svelte', 'TextArea.svelte'];

for (let file of inputFiles) {
    let p = path.join(componentsDir, file);
    if (!fs.existsSync(p)) continue;
    
    let code = fs.readFileSync(p, 'utf8');
    
    code = code.replace(/export function validate\(showUI = true\) \{/g, 'export function validate() {');
    
    if (file === 'PeriodsGrid.svelte') {
        code = code.replace(/let isError = required && \(\!values \|\| values\.length === 0\);[\s\S]*?if \(showUI \|\| \!isError\) \{[\s\S]*?error = isError;[\s\S]*?errorMsg = isError \? ERROR_MESSAGES\.PERIODS\(label \|\| 'Значение'\) : null;[\s\S]*?\}/g, 
`if (required && (!values || values.length === 0)) {
      error = true;
      errorMsg = ERROR_MESSAGES.PERIODS(label || 'Значение');
    } else {
      error = false;
      errorMsg = null;
    }`);
        code = code.replace(/return \!isError;/g, 'return !error;');
    } else if (file === 'RadioGroup.svelte') {
        code = code.replace(/let isError = required && \(value === undefined \|\| value === null \|\| value === ""\);[\s\S]*?if \(showUI \|\| \!isError\) \{[\s\S]*?error = isError;[\s\S]*?errorMsg = isError \? ERROR_MESSAGES\.RADIO\(label \|\| 'Значение'\) : null;[\s\S]*?\}/g, 
`if (required && (value === undefined || value === null || value === "")) {
      error = true;
      errorMsg = ERROR_MESSAGES.RADIO(label || 'Значение');
    } else {
      error = false;
      errorMsg = null;
    }`);
        code = code.replace(/return \!isError;/g, 'return !error;');
    } else if (file === 'TextInput.svelte' || file === 'TextArea.svelte') {
        code = code.replace(/let isError = required && \!value\.trim\(\);[\s\S]*?if \(showUI \|\| \!isError\) \{[\s\S]*?error = isError;[\s\S]*?errorMsg = isError \? ERROR_MESSAGES\.TEXT : null;[\s\S]*?\}/g, 
`if (required && !value.trim()) {
      error = true;
      errorMsg = ERROR_MESSAGES.TEXT;
    } else {
      error = false;
      errorMsg = null;
    }`);
        code = code.replace(/return \!isError;/g, 'return !error;');
    } else if (file === 'SelectInput.svelte') {
        code = code.replace(/let isError = required && \(\!value \|\| value === ""\);[\s\S]*?if \(showUI \|\| \!isError\) \{[\s\S]*?error = isError;[\s\S]*?errorMsg = isError \? "Пожалуйста, выберите значение из списка" : null;[\s\S]*?\}/g, 
`if (required && (!value || value === "")) {
      error = true;
      errorMsg = "Пожалуйста, выберите значение из списка";
    } else {
      error = false;
      errorMsg = null;
    }`);
        code = code.replace(/return \!isError;/g, 'return !error;');
    }
    
    fs.writeFileSync(p, code);
}

console.log("Undo complete.");
