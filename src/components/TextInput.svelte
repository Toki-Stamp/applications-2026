<script>
  import '@material/web/textfield/outlined-text-field.js';
  import '@material/web/icon/icon.js';
  import '@material/web/iconbutton/icon-button.js';
  import { generateId } from '../utils.js';
  import { ERROR_MESSAGES } from '../constants.js';

  /** @type {any} */
  export let value = '';
  export let label = '';
  export let helperText = '';
  export let type = 'text'; // 'text', 'tel', 'number', 'time'
  export let required = false;
  export let min = undefined;
  export let max = undefined;
  export let id = generateId('textinput');
  
  export let icon = '';
  export let placeholder = '';

  let error = false;
  let errorText = '';

  /** @param {Event} e */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    let val = target.value;

    if (type === 'tel') {
      let numbers = val.replace(/\D/g, '');
      if (numbers.length > 0) {
        if (numbers.startsWith('375')) {
          numbers = numbers.substring(3);
        } else if (numbers.startsWith('80')) {
          numbers = numbers.substring(2);
        } else if (numbers.startsWith('8') || numbers.startsWith('7')) {
          numbers = numbers.substring(1);
        }
        
        let res = '+375';
        if (numbers.length > 0) res += ' (' + numbers.substring(0, 2);
        if (numbers.length >= 3) res += ') ' + numbers.substring(2, 5);
        if (numbers.length >= 6) res += ' ' + numbers.substring(5, 9);
        val = res;
        target.value = val;
      }
    }
    
    value = val;
    validate();
  }

  /** @param {Event} e */
  function clearValue(e) {
    e.preventDefault();
    value = '';
    validate();
  }

  export function validate() {
    if (required && !value) {
      error = true;
      errorText = ERROR_MESSAGES.TEXT;
    } else {
      error = false;
      errorText = '';
    }
    return !error;
  }

  // supporting-text is now only used for errors or empty
  $: computedSupportingText = error ? errorText : '';
</script>

<div class="form-group">
  {#if label || helperText}
    <div class="label-container">
      {#if label}
        <div class="group-label">
          {label}
          <span class="optional-tag">
            {required ? "(Обязательно для заполнения)" : ""}
          </span>
        </div>
      {/if}
      {#if helperText}
        <div class="helper-text">
          <strong>Подсказка:</strong> {helperText}
        </div>
      {/if}
    </div>
  {/if}
  <md-outlined-text-field
    {id}
    {type}
    class:is-time-empty={type === 'time' && (!value || value === '')}
    supporting-text={computedSupportingText}
    {error}
    {value}
    {min}
    {max}
    {placeholder}
    on:input={handleInput}
    on:change={validate}
    on:blur={validate}
    on:input
    on:change
  >
    {#if icon}
      <md-icon slot="leading-icon">{icon}</md-icon>
    {/if}
    {#if value && String(value).length > 0}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <md-icon-button slot="trailing-icon" type="button" on:click={clearValue}>
        <md-icon>close</md-icon>
      </md-icon-button>
    {/if}
  </md-outlined-text-field>
</div>

<style>


  md-outlined-text-field {
    width: 100%;
    min-height: 56px;
    --md-outlined-text-field-container-shape: 8px;
  }

  md-outlined-text-field.is-time-empty {
    --md-outlined-text-field-input-text-color: var(--text-placeholder);
    --md-outlined-text-field-hover-input-text-color: var(--text-placeholder);
    --md-outlined-text-field-focus-input-text-color: var(--text-placeholder);
    --md-outlined-text-field-error-input-text-color: var(--text-placeholder);
    --md-outlined-text-field-error-hover-input-text-color: var(--text-placeholder);
    --md-outlined-text-field-error-focus-input-text-color: var(--text-placeholder);
  }
</style>
