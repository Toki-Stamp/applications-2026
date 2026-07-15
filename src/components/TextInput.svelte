<script>
  import '@material/web/textfield/outlined-text-field.js';
  import '@material/web/icon/icon.js';
  import '@material/web/iconbutton/icon-button.js';
  import { generateId } from '../utils.js';
  import { ERROR_MESSAGES } from '../constants.js';

  let {
    value = $bindable(''),
    label = '',
    helperText = '',
    type = 'text',
    required = false,
    min = undefined,
    max = undefined,
    id = generateId('textinput'),
    icon = '',
    placeholder = '',
    errorText = '',
    capitalizeFirst = false,
    ...restProps
  } = $props();

  /** @param {Event} e */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    if (capitalizeFirst && target.value.length > 0) {
      target.value = target.value.charAt(0).toUpperCase() + target.value.slice(1);
    }
    value = target.value;
  }

  /** @param {Event} e */
  function clearValue(e) {
    e.preventDefault();
    value = '';
  }

  const hasError = $derived(!!errorText);
  const computedSupportingText = $derived(hasError ? errorText : '');
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
    error={hasError}
    {value}
    {min}
    {max}
    {placeholder}
    oninput={handleInput}
    {...restProps}
  >
    {#if icon}
      <md-icon slot="leading-icon">{icon}</md-icon>
    {/if}
    {#if value && String(value).length > 0}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <button class="compact-clear-btn" slot="trailing-icon" type="button" onclick={clearValue}>
        <md-icon>close</md-icon>
      </button>
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
