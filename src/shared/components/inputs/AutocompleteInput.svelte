<script>
  import "@material/web/textfield/outlined-text-field.js";
  import "@material/web/menu/menu.js";
  import "@material/web/menu/menu-item.js";
  import "@material/web/icon/icon.js";
  import { generateId } from "$shared/utils.js";
  import FieldLabel from "./FieldLabel.svelte";
  import Button from "$shared/components/ui/Button.svelte";

  /**
   * @typedef {Object} Props
   * @property {string} [value]
   * @property {string} [label]
   * @property {string} [helperText]
   * @property {boolean} [required]
   * @property {string} [id]
   * @property {string} [icon]
   * @property {string} [placeholder]
   * @property {string} [errorText]
   * @property {any[]} [options]
   * @property {boolean} [capitalizeFirst]
   * @property {(e?: Event) => void} [onchange]
   * @property {(e?: Event) => void} [onblur]
   * @property {(e?: Event) => void} [oninput]
   */

  /** @type {Props} */
  let {
    value = $bindable(""),
    label = "",
    helperText = "",
    required = false,
    id = generateId("autocomplete"),
    icon = "",
    placeholder = "",
    errorText = "",
    options = [],
    capitalizeFirst = false,
    onchange = undefined,
    onblur = undefined,
    oninput = undefined,
    ...restProps
  } = $props();

  let isOpen = $state(false);
  let activeIndex = $state(-1);

  /** @type {HTMLDivElement | null} */
  let containerEl = $state(null);
  /** @type {HTMLDivElement | null} */
  let wrapperEl = $state(null);
  /** @type {any} */
  let textFieldEl = $state();
  /** @type {any} */
  let menuEl = $state();

  /** @param {any} opt */
  function getOptionLabel(opt) {
    if (opt == null) return "";
    if (typeof opt === "object") {
      return opt.label ?? opt.name ?? opt.value ?? String(opt.id ?? "");
    }
    return String(opt);
  }

  let filteredOptions = $derived.by(() => {
    if (!options || options.length === 0) return [];

    // Deduplicate options case-insensitively while preserving labels
    const map = new Map();
    for (const opt of options) {
      const label = getOptionLabel(opt)?.trim();
      if (!label) continue;
      const lower = label.toLowerCase();
      if (!map.has(lower)) {
        map.set(lower, opt);
      }
    }
    const uniqueOpts = Array.from(map.values());

    if (!value) return uniqueOpts;
    const lowerVal = String(value).trim().toLowerCase();
    return uniqueOpts.filter((opt) =>
      getOptionLabel(opt).toLowerCase().includes(lowerVal),
    );
  });

  const hasError = $derived(!!errorText);
  const computedSupportingText = $derived(hasError ? errorText : "");

  function updateMenuStyle() {
    if (menuEl && menuEl.shadowRoot && wrapperEl) {
      let style = menuEl.shadowRoot.querySelector("#custom-menu-style");
      if (!style) {
        style = document.createElement("style");
        style.id = "custom-menu-style";
        menuEl.shadowRoot.appendChild(style);
      }
      const outlineColor = hasError
        ? "var(--error, #ba1a1a)"
        : "var(--primary)";
      const width = wrapperEl.offsetWidth;
      style.textContent = `
        .menu {
          outline: 1px solid ${outlineColor} !important;
          outline-offset: -1px !important;
          border-radius: 8px !important;
          min-width: ${width}px !important;
          max-width: ${width}px !important;
          max-height: 250px !important;
          margin-top: 2px !important;
        }

        .items::-webkit-scrollbar,
        .menu::-webkit-scrollbar,
        *::-webkit-scrollbar {
          width: var(--scrollbar-width-sm, 6px) !important;
        }

        .items::-webkit-scrollbar-track,
        .menu::-webkit-scrollbar-track,
        *::-webkit-scrollbar-track {
          background: transparent !important;
        }

        .items::-webkit-scrollbar-thumb,
        .menu::-webkit-scrollbar-thumb,
        *::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--primary) 30%, var(--text-primary) 10%) !important;
          border-radius: var(--scrollbar-radius-sm, 9999px) !important;
        }

        .items::-webkit-scrollbar-thumb:hover,
        .menu::-webkit-scrollbar-thumb:hover,
        *::-webkit-scrollbar-thumb:hover {
          background: color-mix(in srgb, var(--primary) 50%, var(--text-primary) 20%) !important;
        }
      `;
    }
  }

  /** @param {Event} e */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    let val = target.value;
    if (capitalizeFirst && val.length > 0) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
      target.value = val;
    }
    value = val;
    activeIndex = -1;
    oninput?.(e);
    onchange?.();

    if (val.trim().length > 0 && filteredOptions.length > 0) {
      isOpen = true;
    } else {
      isOpen = false;
    }
  }

  function handleFocus() {
    // Only open if there's typed text already
    if (value.trim().length > 0 && filteredOptions.length > 0) {
      isOpen = true;
      activeIndex = -1;
    }
  }

  /** @param {FocusEvent} e */
  function handleBlur(e) {
    onblur?.(e);
  }

  /** @param {KeyboardEvent} e */
  function handleKeyDown(e) {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      if (value.trim().length > 0 && filteredOptions.length > 0) {
        isOpen = true;
        activeIndex = 0;
        e.preventDefault();
      }
      return;
    }

    if (isOpen && filteredOptions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % filteredOptions.length;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex =
          (activeIndex - 1 + filteredOptions.length) % filteredOptions.length;
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          e.preventDefault();
          selectOption(filteredOptions[activeIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        isOpen = false;
      }
    }
  }

  /** @param {any} opt */
  function selectOption(opt) {
    const labelText = getOptionLabel(opt);
    value = labelText;
    isOpen = false;
    activeIndex = -1;
    onchange?.();
  }

  /** @param {Event} e */
  function clearValue(e) {
    e.preventDefault();
    e.stopPropagation();
    value = "";
    isOpen = false;
    activeIndex = -1;
    onchange?.();
    if (textFieldEl) {
      textFieldEl.focus();
    }
  }

  // Anchor setup & menu styling
  $effect(() => {
    if (menuEl && wrapperEl) {
      menuEl.anchor = `${id}-wrapper`;
    }
  });

  $effect(() => {
    if (menuEl) {
      const shouldBeOpen = isOpen && filteredOptions.length > 0;
      menuEl.open = shouldBeOpen;
      if (shouldBeOpen) {
        updateMenuStyle();
      }
    }
  });

  // Click outside & window scroll handlers (same as SelectInput)
  $effect(() => {
    if (!isOpen) return;

    /** @param {Event} e */
    function handlePointerDown(e) {
      const target = /** @type {Node} */ (e.target);
      if (
        containerEl &&
        !containerEl.contains(target) &&
        menuEl &&
        !menuEl.contains(target)
      ) {
        isOpen = false;
      }
    }

    /** @param {Event} e */
    function handleScroll(e) {
      if (navigator.webdriver) return;
      if (
        e.target &&
        containerEl &&
        containerEl.contains(/** @type {Node} */ (e.target))
      ) {
        return;
      }
      isOpen = false;
    }

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("scroll", handleScroll, true);
    };
  });
</script>

<div class="form-group" bind:this={containerEl}>
  <FieldLabel {label} {helperText} {required} />
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
      onkeydown={handleKeyDown}
      autocomplete="off"
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
      {#each filteredOptions as opt, idx}
        {@const labelText = getOptionLabel(opt)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <md-menu-item
          selected={idx === activeIndex}
          onclick={() => selectOption(opt)}
          role="menuitem"
          tabindex="-1"
        >
          <div slot="headline">{labelText}</div>
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
