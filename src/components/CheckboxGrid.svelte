<script>
  import "@material/web/checkbox/checkbox.js";
  import { generateId } from "../utils.js";

  /** @type {string[]} */
  export let values = [];
  /** @type {string} */
  export let label = "";
  /** @type {Array<{id: string, label: string, helperText?: string}>} */
  export let options = [];
  /** @type {boolean} */
  export let required = false;
  /** @type {string} */
  export let name = generateId("checkboxgrid");

  /**
   * @param {Event} e
   * @param {string} optId
   */
  function handleChange(e, optId) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    if (target.checked) {
      if (!values.includes(optId)) {
        values = [...values, optId];
      }
    } else {
      values = values.filter((v) => v !== optId);
    }
  }
  /**
   * @param {string} optId
   * @returns {(e: Event) => void}
   */
  function createChangeHandler(optId) {
    return function (e) {
      handleChange(e, optId);
    };
  }
</script>

<div class="form-group">
  {#if label}
    <h3 class="group-label">
      {label}
      <span class="optional-tag">
        {required ? "(Обязательно для заполнения)" : ""}
      </span>
    </h3>
  {/if}
  <div class="options-grid">
    {#each options as opt}
      {@const mainLabel = opt.label !== undefined ? opt.label : String(opt)}
      {@const suppText = opt.helperText || null}
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label class="checkbox-label">
        <md-checkbox
          class="checkbox-input"
          {name}
          checked={values.includes(opt.id)}
          on:change={createChangeHandler(opt.id)}
        ></md-checkbox>
        <div class="text-container">
          <span class="main-label">{mainLabel}</span>
          {#if suppText}
            <span class="supp-text">{suppText}</span>
          {/if}
        </div>
      </label>
    {/each}
  </div>
</div>

<style>
  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    cursor: pointer;
    padding: 0.3rem 0;
  }

  .checkbox-input {
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
</style>
