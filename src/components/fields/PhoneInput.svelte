<script>
  import { onMount, onDestroy } from "svelte";
  import "@material/web/select/select-option.js";
  import "@material/web/textfield/outlined-text-field.js";
  import "@material/web/iconbutton/icon-button.js";
  import "@material/web/icon/icon.js";
  import "flag-icons/css/flag-icons.min.css";
  import {
    AsYouType,
    isValidPhoneNumber,
    getCountries,
    getCountryCallingCode,
    getExampleNumber,
  } from "libphonenumber-js";
  // @ts-ignore
  import examples from "libphonenumber-js/mobile/examples";
  import { generateId } from "../../utils.js";
  import FieldLabel from "./FieldLabel.svelte";
  import Button from "../ui/Button.svelte";

  let {
    value = $bindable(""),
    label = "",
    helperText = "",
    required = false,
    id = generateId("phoneinput"),
    errorText = "",
    ...restProps
  } = $props();

  const hasError = $derived(!!errorText);

  /** @type {import('libphonenumber-js').CountryCode} */
  let selectedCountry = $state("BY");
  let rawPhoneNumber = $state("");

  // Dropdown state
  let dropdownOpen = $state(false);
  let openUpwards = $state(false);
  let searchQuery = $state("");

  /** @type {HTMLElement} */
  let dropdownRef;

  // Generate country list dynamically
  const regionNames = new Intl.DisplayNames(["ru"], { type: "region" });

  /** @type {Array<{code: import('libphonenumber-js').CountryCode, name: string, dialCode: string}>} */
  const allCountries = getCountries()
    .map((code) => {
      let name = /** @type {string} */ (code);
      try {
        name = regionNames.of(code) || code;
      } catch (e) {
        // Fallback if region is invalid
      }
      return {
        code,
        name,
        dialCode: `+${getCountryCallingCode(code)}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Default priority countries to show at the top
  const priorityCodes = ["BY", "RU", "KZ", "UA", "PL", "LT", "LV"];
  const priorityCountries = priorityCodes
    .map((code) => allCountries.find((c) => c.code === code))
    .filter(Boolean);
  /** @type {Array<{code: import('libphonenumber-js').CountryCode, name: string, dialCode: string}>} */
  // @ts-ignore
  const validPriorityCountries = priorityCountries;

  const otherCountries = allCountries.filter(
    (c) => !priorityCodes.includes(c.code),
  );
  let sortedCountries = [...validPriorityCountries, ...otherCountries];

  const filteredCountries = $derived(
    sortedCountries.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    }),
  );

  // Derived selected country object for UI
  const selectedCountryObj = $derived(
    allCountries.find((c) => c.code === selectedCountry) || allCountries[0],
  );

  // Dynamic placeholder mask based on selected country
  const dynamicPlaceholder = $derived(
    (() => {
      try {
        const phoneNumber = getExampleNumber(selectedCountry, examples);
        if (phoneNumber) {
          const intl = phoneNumber.formatInternational();
          const prefix = `+${phoneNumber.countryCallingCode}`;
          return intl.replace(prefix, "").trim();
        }
        return "";
      } catch (e) {
        return "";
      }
    })(),
  );

  /** @param {Event} e */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    let rawInput = target.value;

    const currentDialCode = selectedCountryObj.dialCode;
    const currentDialCodeDigits = currentDialCode.replace("+", "");

    let cleanInput = rawInput.replace(/[^\d+]/g, "");
    let fullNumberToFormat = cleanInput;

    if (!cleanInput.startsWith("+") && cleanInput !== "") {
      if (cleanInput.startsWith(currentDialCodeDigits)) {
        fullNumberToFormat = "+" + cleanInput;
      } else {
        fullNumberToFormat = currentDialCode + cleanInput;
      }
    } else if (cleanInput === "") {
      fullNumberToFormat = currentDialCode;
    }

    const formatter = new AsYouType();
    const fullFormatted = formatter.input(fullNumberToFormat);
    const numberObj = formatter.getNumber();

    let actualDialCode = currentDialCode;
    if (numberObj && numberObj.countryCallingCode) {
      actualDialCode = "+" + numberObj.countryCallingCode;
      if (numberObj.country && numberObj.country !== selectedCountry) {
        selectedCountry = numberObj.country;
      }
    } else if (fullFormatted.startsWith("+")) {
      const match = fullFormatted.match(/^\+(\d+)/);
      if (match) actualDialCode = "+" + match[1];
    }

    let displayValue = fullFormatted;
    if (displayValue.startsWith(actualDialCode)) {
      displayValue = displayValue.slice(actualDialCode.length).trim();
    }

    rawPhoneNumber = displayValue;
    target.value = displayValue;

    if (numberObj) {
      value = numberObj.number;
    } else {
      value = fullNumberToFormat === currentDialCode ? "" : fullNumberToFormat;
    }
  }

  /** @param {Event} e */
  function clearValue(e) {
    e.preventDefault();
    value = "";
    rawPhoneNumber = "";
  }

  /** @param {import('libphonenumber-js').CountryCode} code */
  function selectCountry(code) {
    selectedCountry = code;
    dropdownOpen = false;
    searchQuery = "";

    if (rawPhoneNumber) {
      const newDialCode =
        allCountries.find((c) => c.code === code)?.dialCode || "";
      const cleanInput = rawPhoneNumber.replace(/[^\d]/g, "");
      const fullNumber = newDialCode + cleanInput;

      const formatter = new AsYouType();
      const fullFormatted = formatter.input(fullNumber);

      let displayValue = fullFormatted;
      if (displayValue.startsWith(newDialCode)) {
        displayValue = displayValue.slice(newDialCode.length).trim();
      }

      rawPhoneNumber = displayValue;

      const numberObj = formatter.getNumber();
      if (numberObj) {
        value = numberObj.number;
      } else {
        value = fullNumber;
      }
    }
  }

  onMount(() => {
    if (value) {
      const formatter = new AsYouType();
      const fullFormatted = formatter.input(value);
      const num = formatter.getNumber();
      let actualDialCode = "";
      if (num && num.country) {
        selectedCountry = num.country;
        actualDialCode = "+" + num.countryCallingCode;
      }

      let displayValue = fullFormatted;
      if (actualDialCode && displayValue.startsWith(actualDialCode)) {
        displayValue = displayValue.slice(actualDialCode.length).trim();
      }
      rawPhoneNumber = displayValue;
    }

    document.addEventListener("click", handleClickOutside);
  });

  onDestroy(() => {
    if (typeof document !== "undefined") {
      document.removeEventListener("click", handleClickOutside);
    }
  });

  /** @param {MouseEvent} event */
  function handleClickOutside(event) {
    if (
      dropdownOpen &&
      dropdownRef &&
      !dropdownRef.contains(/** @type {Node} */ (event.target))
    ) {
      dropdownOpen = false;
    }
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
    if (dropdownOpen) {
      setTimeout(() => {
        const searchInput = dropdownRef?.querySelector(".search-input");
        if (searchInput) /** @type {HTMLInputElement} */ (searchInput).focus();

        if (dropdownRef) {
          const rect = dropdownRef.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          // If less than 350px below, open upwards to avoid footer
          openUpwards = spaceBelow < 350;
        }
      }, 10);
    }
  }

  // supporting-text is now only used for errors or empty
  const computedSupportingText = $derived(hasError ? errorText : "");
</script>

<div class="form-group">
  <FieldLabel {label} {helperText} {required} />

  <div class="phone-inputs-container">
    <!-- Custom Dropdown Container -->
    <div class="country-dropdown-wrapper" bind:this={dropdownRef}>
      <button
        type="button"
        class="country-selector-btn"
        class:active={dropdownOpen}
        onclick={toggleDropdown}
      >
        <span class="fi fi-{selectedCountryObj?.code?.toLowerCase()} flag-icon"
        ></span>
        <span class="dial-code">{selectedCountryObj?.dialCode}</span>
        <md-icon class="arrow-icon">arrow_drop_down</md-icon>
      </button>

      {#if dropdownOpen}
        <div
          class="dropdown-menu"
          class:upwards={openUpwards}
          class:downwards={!openUpwards}
        >
          <div class="search-box">
            <md-icon class="search-icon">search</md-icon>
            <input
              type="text"
              class="search-input"
              placeholder="Поиск..."
              bind:value={searchQuery}
            />
          </div>
          <div class="country-list">
            {#each filteredCountries as country}
              <button
                type="button"
                class="country-item"
                class:selected={selectedCountry === country.code}
                onclick={() => selectCountry(country.code)}
              >
                <span class="fi fi-{country.code.toLowerCase()} flag-icon"
                ></span>
                <span class="name">{country.name}</span>
                <span class="dial-code">{country.dialCode}</span>
              </button>
            {/each}
            {#if filteredCountries.length === 0}
              <div class="no-results">Ничего не найдено</div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="phone-input">
      <md-outlined-text-field
        {id}
        type="tel"
        value={rawPhoneNumber}
        placeholder={dynamicPlaceholder}
        supporting-text={computedSupportingText}
        error={hasError}
        oninput={handleInput}
        {...restProps}
      >
      </md-outlined-text-field>
      {#if rawPhoneNumber && String(rawPhoneNumber).length > 0}
        <Button variant="clear" class="phone-clear-btn" onclick={clearValue}>
          <md-icon>close</md-icon>
        </Button>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(.phone-clear-btn) {
    position: absolute !important;
    right: var(--element-px);
    top: 14px;
  }

  .phone-inputs-container {
    display: flex;
    gap: var(--gap-sm);
    width: 100%;
    position: relative;
  }

  .country-dropdown-wrapper {
    flex: 0 0 105px; /* Narrower to give input more space */
  }

  /* Styling to match md-outlined-text-field */
  .country-selector-btn {
    width: 100%;
    height: 56px;
    background: transparent;
    border: 1px solid var(--input-border-color);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px 0 var(--element-px);
    color: var(--text-primary);
    cursor: pointer;
    font-family: inherit;
    font-size: var(--text-base);
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }

  .country-selector-btn:hover {
    border-color: var(--primary-hover);
  }

  .country-selector-btn:focus-visible,
  .country-selector-btn.active {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary);
  }

  .flag-icon {
    font-size: 15px; /* width 20px, height 15px */
    border-radius: 2px;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.3); /* Add subtle border to white flags */
  }

  .country-selector-btn .dial-code {
    font-size: var(--text-base);
    margin-left: 8px;
    font-weight: normal;
    text-transform: uppercase;
  }

  .country-selector-btn .arrow-icon {
    font-size: var(--text-xl);
    color: var(--text-secondary);
  }

  /* Dropdown Menu */
  .dropdown-menu {
    position: absolute;
    left: 0;
    width: 100%;
    background-color: var(--bg-color-accent);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .dropdown-menu.downwards {
    top: calc(100% + 4px);
  }

  .dropdown-menu.upwards {
    bottom: calc(100% + 4px);
    box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.4);
  }

  .search-box {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--glass-border);
    background-color: var(--bg-color);
  }

  .search-icon {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    margin-right: 12px;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: var(--text-base);
    outline: none;
    font-family: inherit;
  }

  .search-input::placeholder {
    color: var(--text-placeholder);
  }

  .country-list {
    max-height: 280px;
    overflow-y: auto;
  }

  /* Custom Scrollbar for list */
  .country-list::-webkit-scrollbar {
    width: 6px;
  }
  .country-list::-webkit-scrollbar-track {
    background: transparent;
  }
  .country-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }
  .country-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .country-item {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: transparent;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    text-align: left;
    transition: background-color 0.15s;
    font-family: inherit;
  }

  .country-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .country-item.selected {
    background-color: rgba(99, 102, 241, 0.15);
    color: var(--primary);
  }

  .country-item .flag-icon {
    margin-right: 16px;
    flex-shrink: 0;
  }

  .country-item .name {
    flex: 1;
    font-size: var(--text-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 12px;
  }

  .country-item .dial-code {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .country-item.selected .dial-code {
    color: var(--primary);
  }

  .no-results {
    padding: 24px;
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .phone-input {
    flex: 1;
    position: relative;
  }

  .phone-input md-outlined-text-field {
    width: 100%;
    min-height: 56px;
    --md-outlined-text-field-container-shape: 8px;
    --md-outlined-field-leading-space: var(--element-px);
    --md-outlined-field-content-space: var(--element-px);
  }
  
  .phone-input:has(.phone-clear-btn) md-outlined-text-field {
    --md-outlined-field-trailing-space: calc(var(--element-px) * 2 + 24px);
  }

  @media (max-width: 600px) {
    .country-dropdown-wrapper {
      flex: 0 0 88px;
    }
    .country-selector-btn {
      padding: 0 2px 0 10px;
      justify-content: center;
    }
    .country-selector-btn .dial-code {
      margin-left: 3px;
    }
    .country-selector-btn .arrow-icon {
      display: block;
      font-size: var(--text-base);
      margin-left: -2px; /* Pull it slightly closer */
    }
    .flag-icon {
      margin-right: 0;
    }
  }
</style>
