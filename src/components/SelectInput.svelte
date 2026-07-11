<script>
  import "@material/web/select/outlined-select.js";
  import "@material/web/select/select-option.js";
  import "@material/web/icon/icon.js";
  import "@material/web/iconbutton/icon-button.js";
  import { generateId } from "../utils.js";

  /** @type {any} */
  export let value;
  /** @type {string} */
  export let label = "";
  /** @type {string} */
  export let helperText = "";
  /** @type {any[]} */
  export let options = [];
  /** @type {boolean} */
  export let required = false;
  /** @type {string} */
  export let placeholder = "";

  /** @type {string} */
  export let id = generateId("select");
  /** @type {string} */
  export let icon = "";

  let error = false;
  let errorText = "";

  /** @param {Event} e */
  function handleChange(e) {
    const target = /** @type {HTMLSelectElement} */ (e.target);
    value = target.value;
    validate();
  }

  /** @param {Event} e */
  function clearValue(e) {
    e.preventDefault();
    e.stopPropagation();
    value = null;
    validate();
  }

  export function validate() {
    if (required && !value) {
      error = true;
      errorText = "Обязательное поле";
    } else {
      error = false;
      errorText = "";
    }
    return !error;
  }

  // supporting-text is now only used for errors or empty
  $: computedSupportingText = error ? errorText : "";

  /**
   * Svelte action to sync value to the Web Component AFTER children are mounted
   * @param {any} node
   * @param {any} val
   */
  function syncValue(node, val) {
    // Use timeout to ensure all child md-select-option elements are in the DOM
    setTimeout(() => {
      node.value = val != null ? String(val) : "";
    }, 0);
    return {
      /** @param {any} newVal */
      update(newVal) {
        node.value = newVal != null ? String(newVal) : "";
      },
    };
  }
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
  <div class="select-wrapper">
    <md-outlined-select
      class="select-field"
      class:is-empty={!value || value === ""}
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
      {#if placeholder}
        <md-select-option class="placeholder-option" value="" disabled hidden>
          <div slot="headline">{placeholder}</div>
        </md-select-option>
      {/if}
      {#each options as opt}
        {@const optVal =
          opt.value !== undefined ? String(opt.value) : String(opt)}
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

    {#if value && String(value).length > 0}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="clear-button-wrapper">
        <md-icon-button type="button" on:click={clearValue}>
          <md-icon>close</md-icon>
        </md-icon-button>
      </div>
    {/if}
  </div>
</div>

<style>
  .select-wrapper {
    position: relative;
    width: 100%;
  }

  .clear-button-wrapper {
    position: absolute;
    right: 36px;
    top: 50%;
    transform: translateY(-50%);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(
        --bg-color-accent
      ); /* Hide the text underneath if it overlaps */
      border-radius: 50%;
    }

    .select-field {
      width: 100%;
      min-height: 56px;
      --md-outlined-select-text-field-container-shape: 8px;
    }

    .select-field.is-empty {
      --md-outlined-select-text-field-input-text-color: var(--text-placeholder);
      --md-outlined-select-text-field-hover-input-text-color: var(
        --text-placeholder
      );
      --md-outlined-select-text-field-focus-input-text-color: var(
        --text-placeholder
      );
      --md-outlined-select-text-field-error-input-text-color: var(
        --text-placeholder
      );
      --md-outlined-select-text-field-error-hover-input-text-color: var(
        --text-placeholder
      );
      --md-outlined-select-text-field-error-focus-input-text-color: var(
        --text-placeholder
      );
    }

    md-select-option.placeholder-option {
      display: none !important;
    }
</style>
