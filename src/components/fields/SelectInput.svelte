<script>
  import "@material/web/select/outlined-select.js";
  import "@material/web/select/select-option.js";
  import "@material/web/icon/icon.js";
  import { generateId } from "../../utils.js";
  import { ERROR_MESSAGES } from "../../constants.js";
  import FieldLabel from "./FieldLabel.svelte";
  import Button from "../ui/Button.svelte";

  let {
    value = $bindable(),
    label = "",
    helperText = "",
    options = [],
    required = false,
    placeholder = "",
    id = generateId("select"),
    icon = "",
    errorText = "",
    onchange,
    ...restProps
  } = $props();

  /** @param {Event} e */
  function handleChange(e) {
    const target = /** @type {any} */ (e.target);
    const rawVal = target.value;
    console.log('handleChange fired! rawVal:', rawVal);
    // Find the matching option to get the original typed value (e.g. number instead of string)
    const match = options.find((opt) => {
      const v = opt.value !== undefined ? String(opt.value) : String(opt);
      return v === rawVal;
    });
    if (match !== undefined) {
      value = match.value !== undefined ? match.value : match;
    } else if (rawVal === "") {
      value = null;
    } else {
      value = rawVal;
    }
    onchange?.();
  }

  let isOpen = $state(false);
  /** @type {any} */
  let selectEl = $state();

  /** @param {Event} e */
  function clearValue(e) {
    e.preventDefault();
    e.stopPropagation();
    value = null;
    onchange?.();
  }

  const hasError = $derived(!!errorText);
  const computedSupportingText = $derived(hasError ? errorText : "");

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

  $effect(() => {
    if (!isOpen || !selectEl) return;

    /** @param {Event} e */
    function handleScroll(e) {
      // Don't close if the user is scrolling the menu itself
      if (e.target && selectEl.contains(/** @type {Node} */ (e.target))) {
        return;
      }
      selectEl.open = false;
      isOpen = false;
    }

    // Use capture phase to catch all scroll events on the page
    // window.addEventListener("scroll", handleScroll, true);
    return () => {
      // window.removeEventListener("scroll", handleScroll, true);
    };
  });
</script>

<div class="form-group">
  <FieldLabel {label} {helperText} {required} />
  <div class="select-wrapper" class:is-open={isOpen}>
    <md-outlined-select
      bind:this={selectEl}
      class="select-field"
      class:is-empty={value == null || String(value) === ""}
      {id}
      error={hasError}
      error-text={errorText}
      supporting-text={computedSupportingText}
      menu-positioning="popover"
      use:syncValue={value}
      {...restProps}
      onchange={handleChange}
      onopening={() => (isOpen = true)}
      onclosed={() => (isOpen = false)}
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

    {#if value != null && String(value) !== ""}
      <div class="clear-button-wrapper" class:has-error={hasError}>
        <Button variant="clear" onclick={clearValue}>
          <md-icon>close</md-icon>
        </Button>
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
    transition: margin-top 0.2s;
  }

  .clear-button-wrapper.has-error {
    margin-top: -10px;
  }

  .select-field {
    width: 100%;
    min-height: 56px;
    --md-outlined-select-text-field-container-shape: 8px;
  }

  .select-wrapper.is-open .select-field {
    background-color: var(--bg-color-accent);
    border-radius: 8px;
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
