<script>
  import '@material/web/textfield/outlined-text-field.js';
  import { generateId } from '../utils.js';

  export let value = '';
  export let label = '';
  export let helperText = '';
  export let required = false;
  export let placeholder = '';

  export let id = generateId('textarea');

  /** @param {Event} e */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    value = target.value;
  }
</script>

<div class="container">
  {#if label}
    <div class="group-label">
      {label}
      <span class="optional-tag">
        {required ? '(Обязательно для заполнения)' : ''}
      </span>
    </div>
  {/if}
  <md-outlined-text-field
    class="text-field"
    type="textarea"
    rows="3"
    {required}
    {id}
    {placeholder}
    supporting-text={helperText}
    {value}
    on:input={handleInput}
  ></md-outlined-text-field>
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

    .optional-tag {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--accent);
      margin-left: 0.25rem;
    }

    .text-field {
      width: 100%;
      --md-outlined-text-field-container-shape: 4px;
    }
  }
</style>
