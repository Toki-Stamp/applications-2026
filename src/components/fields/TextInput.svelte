<script>
  import "@material/web/textfield/outlined-text-field.js";
  import "@material/web/icon/icon.js";
  import "@material/web/iconbutton/icon-button.js";
  import { generateId } from "../../utils.js";
  import { ERROR_MESSAGES } from "../../constants.js";
  import FieldLabel from "./FieldLabel.svelte";
  import Button from "../ui/Button.svelte";

  let {
    value = $bindable(""),
    label = "",
    helperText = "",
    type = "text",
    required = false,
    min = undefined,
    max = undefined,
    id = generateId("textinput"),
    icon = "",
    placeholder = "",
    errorText = "",
    capitalizeFirst = false,
    ...restProps
  } = $props();

  /** @param {Event} e */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    if (capitalizeFirst && target.value.length > 0) {
      target.value =
        target.value.charAt(0).toUpperCase() + target.value.slice(1);
    }
    value = target.value;
  }

  /** @param {Event} e */
  function clearValue(e) {
    e.preventDefault();
    value = "";
  }

  const hasError = $derived(!!errorText);
  const computedSupportingText = $derived(hasError ? errorText : "");
</script>

<div class="form-group">
  <FieldLabel {label} {helperText} {required} />
  <div class="input-wrapper">
    <md-outlined-text-field
      {id}
      {type}
      class="text-field"
      class:is-time-empty={type === "time" && (!value || value === "")}
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
    </md-outlined-text-field>

    {#if value && String(value).length > 0}
      <div class="clear-button-wrapper" class:has-error={hasError}>
        <Button variant="clear" onclick={clearValue}>
          <md-icon>close</md-icon>
        </Button>
      </div>
    {/if}
  </div>
</div>

<style>
  .input-wrapper {
    position: relative;
    width: 100%;
  }

  .text-field {
    width: 100%;
    min-height: 56px;
    --md-outlined-text-field-container-shape: 8px;
  }

  .clear-button-wrapper {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-color-accent);
    border-radius: 50%;
    transition: margin-top 0.2s;
  }

  .clear-button-wrapper.has-error {
    margin-top: -10px;
  }

  .text-field.is-time-empty {
    --md-outlined-text-field-input-text-color: var(--text-placeholder);
    --md-outlined-text-field-hover-input-text-color: var(--text-placeholder);
    --md-outlined-text-field-focus-input-text-color: var(--text-placeholder);
    --md-outlined-text-field-error-input-text-color: var(--text-placeholder);
    --md-outlined-text-field-error-hover-input-text-color: var(
      --text-placeholder
    );
    --md-outlined-text-field-error-focus-input-text-color: var(
      --text-placeholder
    );
  }
</style>
