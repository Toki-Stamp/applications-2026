<script>
  import '@material/web/textfield/outlined-text-field.js';
  import '@material/web/icon/icon.js';
  import '@material/web/iconbutton/icon-button.js';
  import { generateId } from '../utils.js';

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
      errorText = 'Обязательное поле';
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
  {#if label}
    <div class="group-label" class:has-helper={!!helperText}>
      {label}
      <span class="optional-tag">
        {required ? '(Обязательно для заполнения)' : ''}
      </span>
    </div>
  {/if}
  {#if helperText}
    <div class="helper-text">
      <strong>Подсказка:</strong> {helperText}
    </div>
  {/if}
  <md-outlined-text-field
    {id}
    {type}
    supporting-text={computedSupportingText}
    {error}
    {required}
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
  .form-group {
    position: relative;
    margin-top: 1rem;
    margin-bottom: 1.5rem;

    .group-label {
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .group-label.has-helper {
      margin-bottom: 2px;
    }

    .helper-text {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }

    .optional-tag {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--accent);
      margin-left: 0.25rem;
    }
  }

  md-outlined-text-field {
    width: 100%;
    --md-outlined-text-field-container-shape: 8px;
  }
</style>
