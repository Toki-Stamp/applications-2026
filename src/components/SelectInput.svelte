<script>
  import '@material/web/select/outlined-select.js';
  import '@material/web/select/select-option.js';
  import { generateId } from '../utils.js';

  /** @type {any} */
  export let value;
  /** @type {string} */
  export let label = '';
  /** @type {string} */
  export let helperText = '';
  /** @type {any[]} */
  export let options = [];
  /** @type {boolean} */
  export let required = false;

  /** @type {string} */
  export let id = generateId('select');
  /** @type {string} */
  export let icon = '';

  let error = false;
  let errorText = '';

  /** @param {Event} e */
  function handleChange(e) {
    const target = /** @type {HTMLSelectElement} */ (e.target);
    value = target.value;
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

  /** 
   * Svelte action to sync value to the Web Component AFTER children are mounted
   * @param {any} node 
   * @param {any} val 
   */
  function syncValue(node, val) {
    // Use timeout to ensure all child md-select-option elements are in the DOM
    setTimeout(() => {
      node.value = val != null ? String(val) : '';
    }, 0);
    return {
      /** @param {any} newVal */
      update(newVal) {
        node.value = newVal != null ? String(newVal) : '';
      }
    };
  }
</script>

<div class="container">
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
  <md-outlined-select
    class="select-field"
    {required}
    {id}
    {error}
    error-text={errorText}
    supporting-text={computedSupportingText}
    use:syncValue={value}
    on:change={handleChange}
  >
    {#if icon}
      <md-icon slot="leading-icon">{icon}</md-icon>
    {/if}
    {#each options as opt}
      {@const optVal = opt.value !== undefined ? String(opt.value) : String(opt)}
      {@const mainLabel = opt.label !== undefined ? opt.label : String(opt)}
      {@const suppText = opt.helperText || null}
      <md-select-option value={optVal}>
        <div slot="headline">{mainLabel}</div>
        {#if suppText}
          <div slot="supporting-text">{suppText}</div>
        {/if}
      </md-select-option>
    {/each}
  </md-outlined-select>
</div>

<style>
  .container {
    margin-bottom: 1.5rem;
    width: 100%;

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

    .select-field {
      width: 100%;
      --md-outlined-select-text-field-container-shape: 4px;
    }
  }
</style>
