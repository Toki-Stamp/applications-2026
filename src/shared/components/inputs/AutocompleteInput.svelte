<script>
  import "@material/web/textfield/outlined-text-field.js";
  import "@material/web/menu/menu.js";
  import "@material/web/menu/menu-item.js";
  import { generateId } from "$shared/utils.js";
  import FieldLabel from "./FieldLabel.svelte";
  import Button from "$shared/components/ui/Button.svelte";
  import { onMount } from "svelte";

  let {
    value = $bindable(""),
    label = "",
    helperText = "",
    required = false,
    id = generateId("autocomplete"),
    icon = "",
    placeholder = "",
    errorText = "",
    options = [], // string[]
    capitalizeFirst = false,
    ...restProps
  } = $props();

  let isOpen = $state(false);
  let isFocused = $state(false);
  let filteredOptions = $derived.by(() => {
    if (!value) return options;
    const lowerVal = value.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(lowerVal));
  });

  /** @type {any} */
  let textFieldEl = $state();
  /** @type {any} */
  let menuEl = $state();
  /** @type {HTMLDivElement | null} */
  let wrapperEl = $state(null);

  /** @param {Event} e */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    if (capitalizeFirst && target.value.length > 0) {
      target.value =
        target.value.charAt(0).toUpperCase() + target.value.slice(1);
    }
    value = target.value;
    if (filteredOptions.length > 0) {
      isOpen = true;
    }
  }

  /** @param {Event} e */
  function clearValue(e) {
    e.preventDefault();
    value = "";
    if (options.length > 0) {
      isOpen = true;
    }
    // Re-focus the text field after clear
    setTimeout(() => {
      if (textFieldEl) textFieldEl.focus();
    }, 0);
  }

  function handleFocus() {
    isFocused = true;
    if (filteredOptions.length > 0) {
      isOpen = true;
    }
  }

  function handleBlur() {
    // Timeout to allow click events on menu items to process before closing
    setTimeout(() => {
      isFocused = false;
      isOpen = false;
    }, 200);
  }

  /** @param {string} opt */
  function handleSelect(opt) {
    value = opt;
    isOpen = false;
  }

  const hasError = $derived(!!errorText);
  const computedSupportingText = $derived(hasError ? errorText : "");

  onMount(() => {
    if (menuEl && wrapperEl) {
      menuEl.anchor = `${id}-wrapper`;
      
      // Inject custom styles into the menu shadowRoot to match our design
      // Wait for shadow root to be ready
      setTimeout(() => {
        if (menuEl.shadowRoot) {
          let style = menuEl.shadowRoot.querySelector("#custom-menu-style");
          if (!style) {
            style = document.createElement("style");
            style.id = "custom-menu-style";
            menuEl.shadowRoot.appendChild(style);
          }
          const outlineColor = "var(--primary)";
          style.textContent = `
            .menu {
              outline: 1px solid ${outlineColor} !important;
              outline-offset: -1px !important;
              border-radius: 8px !important;
              max-height: 250px !important;
            }
          `;
        }
      }, 50);
    }
  });

  $effect(() => {
    if (menuEl) {
      menuEl.open = isOpen;
    }
  });
</script>

<div class="form-group">
  <FieldLabel {label} {helperText} {required} />
  <!-- We use wrapperEl as the anchor for the menu to match the width -->
  <div class="input-wrapper" id="{id}-wrapper" bind:this={wrapperEl}>
    <md-outlined-text-field
      bind:this={textFieldEl}
      {id}
      type="text"
      class="text-field"
      supporting-text={computedSupportingText}
      error={hasError}
      {value}
      {placeholder}
      oninput={handleInput}
      onfocus={handleFocus}
      onblur={handleBlur}
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

    <md-menu 
      bind:this={menuEl} 
      positioning="popover" 
      default-focus="none"
      class="autocomplete-menu"
      style:--md-menu-container-shape="8px"
      style:--md-menu-container-elevation="var(--shadow-md)"
    >
      {#each filteredOptions as opt}
        <!-- Use onmousedown instead of onclick so it fires before blur -->
        <md-menu-item onmousedown={() => handleSelect(opt)} role="menuitem" tabindex="-1">
          <div slot="headline">{opt}</div>
        </md-menu-item>
      {/each}
    </md-menu>
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
    --md-outlined-field-leading-space: var(--element-px);
    --md-outlined-field-with-leading-content-leading-space: var(--element-px);
    --md-outlined-field-content-space: var(--element-px);
    --md-outlined-field-with-trailing-content-trailing-space: var(--element-px);
  }

  .input-wrapper:has(.clear-button-wrapper) .text-field {
    --md-outlined-field-trailing-space: calc(var(--element-px) * 2 + 24px);
  }

  .clear-button-wrapper {
    position: absolute;
    right: var(--element-px);
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

  .autocomplete-menu {
    max-width: 100%;
    width: 100%;
  }

  md-menu-item [slot="headline"] {
    white-space: normal;
    line-height: var(--line-height-normal);
  }
</style>
