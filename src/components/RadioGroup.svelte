<script>
  import "@material/web/radio/radio.js";
  import { generateId } from "../utils.js";
  import HintBox from "./HintBox.svelte";
  import { ERROR_MESSAGES } from "../constants.js";

  /** @type {any} */
  export let value;
  /** @type {string} */
  export let label = "";
  /** @type {any[]} */
  export let options = [];
  /** @type {boolean} */
  export let required = false;
  /** @type {string} */
  export let name = generateId("radiogroup");

  /** @param {any} optValue */
  function handleChange(optValue) {
    value = optValue;
    validate();
  }

  let error = false;
  /** @type {{prefix: string, label: string, suffix: string} | null} */
  let errorMsg = null;

  export function validate() {
    if (required && (value === undefined || value === null || value === "")) {
      error = true;
      errorMsg = ERROR_MESSAGES.RADIO(label || 'Значение');
    } else {
      error = false;
      errorMsg = null;
    }
    return !error;
  }
</script>

<div class="form-group">
  {#if label}
    <div class="group-label">
      {label}
      <span class="optional-tag">
        {required ? "(Обязательно для заполнения)" : ""}
      </span>
    </div>
  {/if}
  <div class="options-container">
    {#each options as opt}
      {@const optVal = opt.value !== undefined ? opt.value : opt}
      {@const mainLabel = opt.label !== undefined ? opt.label : String(opt)}
      {@const suppText = opt.helperText || null}
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label class="radio-label">
        <md-radio
          class="radio-input"
          {name}
          value={optVal}
          checked={value === optVal}
          on:change={() => handleChange(optVal)}
        ></md-radio>
        <div class="text-container">
          <span class="main-label">{mainLabel}</span>
          {#if suppText}
            <span class="supp-text">
              <strong>Подсказка:</strong>
              {suppText}
            </span>
          {/if}
        </div>
      </label>
    {/each}
  </div>
  {#if error && errorMsg}
    <div class="error-wrapper">
      <HintBox type="error">
        {errorMsg.prefix}<strong class="text-primary">{errorMsg.label}</strong>{errorMsg.suffix}
      </HintBox>
    </div>
  {/if}
</div>

<style>
  .options-container {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .radio-label {
    display: flex;
    align-items: flex-start;
    cursor: pointer;
    padding: 0.3rem 0;
  }

  .radio-input {
    margin-top: 2px;
    flex-shrink: 0;
  }

  .text-container {
    margin-left: 12px;
    display: flex;
    flex-direction: column;
  }

  .main-label {
    color: var(--text-primary);
  }

  .supp-text {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .error-wrapper {
    margin-top: 0.5rem;
  }
</style>
