const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Refactor App.svelte
let appSveltePath = path.join(srcDir, 'App.svelte');
let appCode = fs.readFileSync(appSveltePath, 'utf8');

appCode = appCode.replace(/stepErrors = getStepErrors\(\);/g, 'stepErrors = getStepErrors(false);');

appCode = appCode.replace(/function getStepErrors\(\) {/g, 'function getStepErrors(showUI = true) {');

const blocks = ['formatBlock', 'personalDataBlock', 'transportBlock', 'provisionsBlock', 'accommodationBlock', 'freeMicBlock'];
for (let b of blocks) {
    appCode = appCode.replace(new RegExp(`errors = ${b}\\.validate\\(\\);`, 'g'), `errors = ${b}.validate(showUI);`);
}
fs.writeFileSync(appSveltePath, appCode);

// 2. Refactor all Blocks
const blocksDir = path.join(srcDir, 'blocks');
const blockFiles = fs.readdirSync(blocksDir).filter(f => f.endsWith('Block.svelte'));

for (let file of blockFiles) {
    let p = path.join(blocksDir, file);
    let code = fs.readFileSync(p, 'utf8');
    
    // export function validate() -> export function validate(showUI = true)
    code = code.replace(/export function validate\(\) {/g, 'export function validate(showUI = true) {');
    
    // .validate() -> .validate(showUI)
    // we match !varName.validate()
    code = code.replace(/\.validate\(\)/g, '.validate(showUI)');
    
    fs.writeFileSync(p, code);
}

// 3. Refactor all Inputs
const componentsDir = path.join(srcDir, 'components');
const inputFiles = ['TextInput.svelte', 'SelectInput.svelte', 'RadioGroup.svelte', 'PeriodsGrid.svelte', 'TextArea.svelte'];

for (let file of inputFiles) {
    let p = path.join(componentsDir, file);
    if (!fs.existsSync(p)) continue;
    
    let code = fs.readFileSync(p, 'utf8');
    
    code = code.replace(/export function validate\(\) \{/g, 'export function validate(showUI = true) {');
    
    if (file === 'PeriodsGrid.svelte') {
        code = code.replace(/if \(required && \(!values \|\| values\.length === 0\)\) \{[\s\S]*?\} else \{[\s\S]*?\}/g, 
`let isError = required && (!values || values.length === 0);
    if (showUI || !isError) {
      error = isError;
      errorMsg = isError ? ERROR_MESSAGES.PERIODS(label || 'Значение') : null;
    }`);
        code = code.replace(/return !error;/g, 'return !isError;');
    } else if (file === 'RadioGroup.svelte') {
        code = code.replace(/if \(required && \(value === undefined \|\| value === null \|\| value === ""\)\) \{[\s\S]*?\} else \{[\s\S]*?\}/g, 
`let isError = required && (value === undefined || value === null || value === "");
    if (showUI || !isError) {
      error = isError;
      errorMsg = isError ? ERROR_MESSAGES.RADIO(label || 'Значение') : null;
    }`);
        code = code.replace(/return !error;/g, 'return !isError;');
    } else if (file === 'TextInput.svelte' || file === 'TextArea.svelte') {
        code = code.replace(/if \(required && !value\.trim\(\)\) \{[\s\S]*?\} else \{[\s\S]*?\}/g, 
`let isError = required && !value.trim();
    if (showUI || !isError) {
      error = isError;
      errorMsg = isError ? ERROR_MESSAGES.TEXT : null;
    }`);
        code = code.replace(/return !error;/g, 'return !isError;');
    } else if (file === 'SelectInput.svelte') {
        code = code.replace(/if \(required && \(!value \|\| value === ""\)\) \{[\s\S]*?\} else \{[\s\S]*?\}/g, 
`let isError = required && (!value || value === "");
    if (showUI || !isError) {
      error = isError;
      errorMsg = isError ? "Пожалуйста, выберите значение из списка" : null;
    }`);
        code = code.replace(/return !error;/g, 'return !isError;');
    }
    
    fs.writeFileSync(p, code);
}

console.log("Refactoring complete.");
