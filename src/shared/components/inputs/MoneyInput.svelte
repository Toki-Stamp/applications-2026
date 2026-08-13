<script>
  import { generateId } from "$shared/utils.js";
  import FieldLabel from "./FieldLabel.svelte";
  import Button from "$shared/components/ui/Button.svelte";

  /**
   * @typedef {Object} Props
   * @property {string} [value]
   * @property {string} [label]
   * @property {string} [helperText]
   * @property {string} [placeholder]
   * @property {string} [icon]
   * @property {string} [errorText]
   * @property {string} [currency]
   * @property {boolean} [required]
   * @property {string} [id]
   * @property {(e?: Event) => void} [onblur]
   * @property {(e?: Event) => void} [onchange]
   * @property {(e?: Event) => void} [oninput]
   */

  /** @type {Props} */
  let {
    value = $bindable(""),
    label = "",
    helperText = "",
    placeholder = "0.00",
    icon = "payments",
    errorText = "",
    currency = "",
    required = false,
    id = generateId("money"),
    onblur = undefined,
    onchange = undefined,
    oninput = undefined,
    ...restProps
  } = $props();

  const hasError = $derived(!!errorText);
  const computedSupportingText = $derived(hasError ? errorText : "");

  /**
   * Sanitize raw input to a valid money string.
   * - Allows digits, one dot/comma as decimal separator
   * - Normalizes comma -> dot
   * - Limits to 2 decimal places
   * - No leading zeros except "0."
   * @param {string} raw
   * @returns {string}
   */
  function sanitize(raw) {
    // Normalize comma to dot
    let s = raw.replace(",", ".");

    // Remove anything that isn't a digit or dot
    s = s.replace(/[^\d.]/g, "");

    // Keep only the first dot
    const parts = s.split(".");
    if (parts.length > 2) {
      s = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit decimal part to 2 digits
    if (s.includes(".")) {
      const [intPart, decPart] = s.split(".");
      s = intPart + "." + decPart.slice(0, 2);
    }

    // Remove leading zeros before the integer part (but allow "0.")
    s = s.replace(/^0+(\d)/, "$1");

    return s;
  }

  /** @param {Event} e */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    const cursor = target.selectionStart ?? target.value.length;
    const before = target.value;
    const cleaned = sanitize(before);

    if (cleaned !== before) {
      target.value = cleaned;
      const newCursor = Math.min(cursor, cleaned.length);
      target.setSelectionRange(newCursor, newCursor);
    }

    value = cleaned;
    oninput?.(e);
    onchange?.();
  }

  /** @param {FocusEvent} e */
  function handleBlur(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    if (target.value && target.value !== "") {
      const num = parseFloat(target.value);
      if (!isNaN(num)) {
        value = num.toFixed(2);
        target.value = value;
      }
    }
    onblur?.(e);
  }

  /** @param {FocusEvent} e */
  function handleFocus(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    if (target.value === "0.00") {
      value = "";
      target.value = "";
    }
  }

  /** @param {Event} e */
  function clearValue(e) {
    e.preventDefault();
    value = "";
    onchange?.();
  }
</script>

<div class="form-group">
  <FieldLabel {label} {helperText} {required} />
  <div class="input-wrapper">
    <md-outlined-text-field
      {id}
      type="text"
      inputmode="decimal"
      class="text-field"
      supporting-text={computedSupportingText}
      error={hasError}
      {value}
      {placeholder}
      oninput={handleInput}
      onblur={handleBlur}
      onfocus={handleFocus}
      autocomplete="off"
      {...restProps}
    >
      {#if icon}
        <md-icon slot="leading-icon">{icon}</md-icon>
      {/if}
      {#if currency}
        <span slot="trailing-icon" class="currency-badge">{currency}</span>
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
    min-height: var(--input-min-height);
    --md-outlined-text-field-container-shape: var(--radius-sm);
    --md-outlined-field-leading-space: var(--element-px);
    --md-outlined-field-with-leading-content-leading-space: var(--element-px);
    --md-outlined-field-content-space: var(--element-px);
    --md-outlined-field-with-trailing-content-trailing-space: var(--element-px);
  }

  .input-wrapper:has(.clear-button-wrapper) .text-field {
    --md-outlined-field-trailing-space: calc(var(--element-px) * 2 + var(--text-2xl));
  }

  .clear-button-wrapper {
    position: absolute;
    right: var(--element-px);
    top: 50%;
    transform: translateY(-50%);
    z-index: var(--z-controls);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-color-accent);
    border-radius: var(--radius-full);
    transition: margin-top var(--transition-normal);
  }

  .clear-button-wrapper.has-error {
    margin-top: -10px;
  }

  .currency-badge {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.04em;
    pointer-events: none;
    user-select: none;
  }
</style>
