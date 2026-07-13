const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 2. Refactor all Blocks
const blocksDir = path.join(srcDir, 'blocks');
const blockFiles = fs.readdirSync(blocksDir).filter(f => f.endsWith('Block.svelte'));

for (let file of blockFiles) {
    let p = path.join(blocksDir, file);
    let code = fs.readFileSync(p, 'utf8');
    
    code = code.replace(/export function validate\(\) \{/g, 'export function validate(forceTouch = false) {');
    // We only replace .validate() with .validate(forceTouch) inside validate method
    code = code.replace(/\.validate\(\)/g, '.validate(forceTouch)');
    
    fs.writeFileSync(p, code);
}

// 3. Refactor all Inputs
const componentsDir = path.join(srcDir, 'components');
const inputFiles = ['TextInput.svelte', 'SelectInput.svelte', 'RadioGroup.svelte', 'PeriodsGrid.svelte', 'TextArea.svelte'];

for (let file of inputFiles) {
    let p = path.join(componentsDir, file);
    if (!fs.existsSync(p)) continue;
    
    let code = fs.readFileSync(p, 'utf8');
    
    if (!code.includes('let isTouched')) {
        code = code.replace(/let error = false;/g, 'let isTouched = false;\n  let error = false;');
    }
    
    code = code.replace(/export function validate\(\) \{/g, 'export function validate(forceTouch = false) {');
    
    if (file === 'PeriodsGrid.svelte') {
        code = code.replace(/function handleToggle\(id\) \{/g, 'function handleToggle(id) {\n    isTouched = true;');
        code = code.replace(/if \(required && \(\!values \|\| values\.length === 0\)\) \{[\s\S]*?\} else \{[\s\S]*?\}/g, 
`if (forceTouch) isTouched = true;
    let isError = required && (!values || values.length === 0);
    if (isTouched) {
      error = isError;
      errorMsg = isError ? ERROR_MESSAGES.PERIODS(label || 'Значение') : null;
    } else {
      error = false;
      errorMsg = null;
    }`);
        code = code.replace(/return \!error;/g, 'return !isError;');
    } else if (file === 'RadioGroup.svelte') {
        code = code.replace(/function handleChange\(optValue\) \{/g, 'function handleChange(optValue) {\n    isTouched = true;');
        code = code.replace(/if \(required && \(value === undefined \|\| value === null \|\| value === ""\)\) \{[\s\S]*?\} else \{[\s\S]*?\}/g, 
`if (forceTouch) isTouched = true;
    let isError = required && (value === undefined || value === null || value === "");
    if (isTouched) {
      error = isError;
      errorMsg = isError ? ERROR_MESSAGES.RADIO(label || 'Значение') : null;
    } else {
      error = false;
      errorMsg = null;
    }`);
        code = code.replace(/return \!error;/g, 'return !isError;');
    } else if (file === 'TextInput.svelte' || file === 'TextArea.svelte') {
        code = code.replace(/function handleInput\(e\) \{/g, 'function handleInput(e) {\n    isTouched = true;');
        code = code.replace(/if \(required && \!value\.trim\(\)\) \{[\s\S]*?\} else \{[\s\S]*?\}/g, 
`if (forceTouch) isTouched = true;
    let isError = required && !value.trim();
    if (isTouched) {
      error = isError;
      errorMsg = isError ? ERROR_MESSAGES.TEXT : null;
    } else {
      error = false;
      errorMsg = null;
    }`);
        code = code.replace(/return \!error;/g, 'return !isError;');
    } else if (file === 'SelectInput.svelte') {
        code = code.replace(/function handleSelect\(optValue\) \{/g, 'function handleSelect(optValue) {\n    isTouched = true;');
        code = code.replace(/function clearSelection\(\) \{/g, 'function clearSelection() {\n    isTouched = true;');
        code = code.replace(/if \(required && \(\!value \|\| value === ""\)\) \{[\s\S]*?\} else \{[\s\S]*?\}/g, 
`if (forceTouch) isTouched = true;
    let isError = required && (!value || value === "");
    if (isTouched) {
      error = isError;
      errorMsg = isError ? "Пожалуйста, выберите значение из списка" : null;
    } else {
      error = false;
      errorMsg = null;
    }`);
        code = code.replace(/return \!error;/g, 'return !isError;');
    }
    
    fs.writeFileSync(p, code);
}

console.log("isTouched Refactoring complete.");
