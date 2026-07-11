<script>
  import { onMount, onDestroy } from 'svelte';
  import '@material/web/select/select-option.js';
  import '@material/web/textfield/outlined-text-field.js';
  import 'flag-icons/css/flag-icons.min.css';
  import { AsYouType, isValidPhoneNumber, getCountries, getCountryCallingCode, getExampleNumber } from 'libphonenumber-js';
  // @ts-ignore
  import examples from 'libphonenumber-js/mobile/examples';
  import { generateId } from '../utils.js';

  export let value = '';
  export let label = '';
  export let helperText = '';
  export let required = false;
  export let id = generateId('phoneinput');

  let error = false;
  let errorText = '';

  /** @type {import('libphonenumber-js').CountryCode} */
  let selectedCountry = 'BY';
  let rawPhoneNumber = '';

  // Dropdown state
  let dropdownOpen = false;
  let openUpwards = false;
  let searchQuery = '';
  
  /** @type {HTMLElement} */
  let dropdownRef;
  
  // Generate country list dynamically
  const regionNames = new Intl.DisplayNames(['ru'], { type: 'region' });

  /** @type {Array<{code: import('libphonenumber-js').CountryCode, name: string, dialCode: string}>} */
  const allCountries = getCountries().map(code => {
    let name = /** @type {string} */ (code);
    try {
      name = regionNames.of(code) || code;
    } catch (e) {
      // Fallback if region is invalid
    }
    return {
      code,
      name,
      dialCode: `+${getCountryCallingCode(code)}`
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Default priority countries to show at the top
  const priorityCodes = ['BY', 'RU', 'KZ', 'UA', 'PL', 'LT', 'LV'];
  const priorityCountries = priorityCodes.map(code => allCountries.find(c => c.code === code)).filter(Boolean);
  /** @type {Array<{code: import('libphonenumber-js').CountryCode, name: string, dialCode: string}>} */
  // @ts-ignore
  const validPriorityCountries = priorityCountries;

  const otherCountries = allCountries.filter(c => !priorityCodes.includes(c.code));
  let sortedCountries = [...validPriorityCountries, ...otherCountries];

  $: filteredCountries = sortedCountries.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.dialCode.includes(q) || c.code.toLowerCase().includes(q);
  });

  // Derived selected country object for UI
  $: selectedCountryObj = allCountries.find(c => c.code === selectedCountry) || allCountries[0];

  // Dynamic placeholder mask based on selected country
  $: dynamicPlaceholder = (() => {
    try {
      const phoneNumber = getExampleNumber(selectedCountry, examples);
      if (phoneNumber) {
        const intl = phoneNumber.formatInternational();
        const prefix = `+${phoneNumber.countryCallingCode}`;
        return intl.replace(prefix, '').trim();
      }
      return '';
    } catch (e) {
      return '';
    }
  })();

  /** @param {Event} e */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    let rawInput = target.value;
    
    const currentDialCode = selectedCountryObj.dialCode;
    const currentDialCodeDigits = currentDialCode.replace('+', '');
    
    let cleanInput = rawInput.replace(/[^\d+]/g, '');
    let fullNumberToFormat = cleanInput;
    
    if (!cleanInput.startsWith('+') && cleanInput !== '') {
      if (cleanInput.startsWith(currentDialCodeDigits)) {
         fullNumberToFormat = '+' + cleanInput;
      } else {
         fullNumberToFormat = currentDialCode + cleanInput;
      }
    } else if (cleanInput === '') {
      fullNumberToFormat = currentDialCode;
    }
    
    const formatter = new AsYouType();
    const fullFormatted = formatter.input(fullNumberToFormat);
    const numberObj = formatter.getNumber();
    
    let actualDialCode = currentDialCode;
    if (numberObj && numberObj.countryCallingCode) {
      actualDialCode = '+' + numberObj.countryCallingCode;
      if (numberObj.country && numberObj.country !== selectedCountry) {
        selectedCountry = numberObj.country;
      }
    } else if (fullFormatted.startsWith('+')) {
       const match = fullFormatted.match(/^\+(\d+)/);
       if (match) actualDialCode = '+' + match[1];
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
      value = fullNumberToFormat === currentDialCode ? '' : fullNumberToFormat;
    }
    
    validate();
  }

  /** @param {import('libphonenumber-js').CountryCode} code */
  function selectCountry(code) {
    selectedCountry = code;
    dropdownOpen = false;
    searchQuery = '';
    
    if (rawPhoneNumber) {
      const newDialCode = allCountries.find(c => c.code === code)?.dialCode || '';
      const cleanInput = rawPhoneNumber.replace(/[^\d]/g, '');
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
    validate();
  }

  export function validate() {
    if (required && (!rawPhoneNumber || rawPhoneNumber.trim() === '')) {
      error = true;
      errorText = 'Обязательное поле';
      return false;
    }
    
    if (rawPhoneNumber && rawPhoneNumber.trim() !== '') {
      if (!isValidPhoneNumber(rawPhoneNumber, selectedCountry)) {
        error = true;
        errorText = 'Неверный номер телефона';
        return false;
      }
    }

    error = false;
    errorText = '';
    return true;
  }
  
  onMount(() => {
    if (value) {
      const formatter = new AsYouType();
      const fullFormatted = formatter.input(value);
      const num = formatter.getNumber();
      let actualDialCode = '';
      if (num && num.country) {
        selectedCountry = num.country;
        actualDialCode = '+' + num.countryCallingCode;
      }
      
      let displayValue = fullFormatted;
      if (actualDialCode && displayValue.startsWith(actualDialCode)) {
        displayValue = displayValue.slice(actualDialCode.length).trim();
      }
      rawPhoneNumber = displayValue;
    }
    
    document.addEventListener('click', handleClickOutside);
  });
  
  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
    }
  });

  /** @param {MouseEvent} event */
  function handleClickOutside(event) {
    if (dropdownOpen && dropdownRef && !dropdownRef.contains(/** @type {Node} */ (event.target))) {
      dropdownOpen = false;
    }
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
    if (dropdownOpen) {
      setTimeout(() => {
        const searchInput = dropdownRef?.querySelector('.search-input');
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

  $: computedSupportingText = error ? errorText : '';
</script>

<div class="form-group">
  {#if label || helperText}
    <div class="label-container">
      {#if label}
        <div class="group-label">
          {label}
          <span class="optional-tag">
            {required ? '(Обязательно для заполнения)' : ''}
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
  
  <div class="phone-inputs-container">
    <!-- Custom Dropdown Container -->
    <div class="country-dropdown-wrapper" bind:this={dropdownRef}>
      <button 
        type="button" 
        class="country-selector-btn" 
        class:active={dropdownOpen}
        on:click={toggleDropdown}
      >
        <span class="fi fi-{selectedCountryObj?.code?.toLowerCase()} flag-icon"></span>
        <span class="dial-code">{selectedCountryObj?.dialCode}</span>
        <md-icon class="arrow-icon">arrow_drop_down</md-icon>
      </button>

      {#if dropdownOpen}
        <div class="dropdown-menu" class:upwards={openUpwards} class:downwards={!openUpwards}>
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
                on:click={() => selectCountry(country.code)}
              >
                <span class="fi fi-{country.code.toLowerCase()} flag-icon"></span>
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
        {error}
        {required}
        on:input={handleInput}
        on:change={validate}
        on:blur={validate}
      ></md-outlined-text-field>
    </div>
  </div>
</div>


<style>
  .phone-inputs-container {
    display: flex;
    gap: 8px;
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
    border: 1px solid var(--border-color);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px 0 16px;
    color: var(--text-primary);
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .country-selector-btn:hover {
    border-color: var(--primary-hover);
  }

  .country-selector-btn:focus-visible,
  .country-selector-btn.active {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 1px var(--primary);
  }

  .flag-icon {
    font-size: 15px; /* width 20px, height 15px */
    border-radius: 2px;
    box-shadow: 0 0 1px rgba(0,0,0,0.3); /* Add subtle border to white flags */
  }

  .country-selector-btn .dial-code {
    font-size: 0.9rem;
    margin-left: 8px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .country-selector-btn .arrow-icon {
    font-size: 20px;
    color: var(--text-secondary);
  }

  /* Dropdown Menu */
  .dropdown-menu {
    position: absolute;
    left: 0;
    width: 100%;
    background-color: var(--bg-color-accent);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
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
    font-size: 18px;
    color: var(--text-secondary);
    margin-right: 12px;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 0.95rem;
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
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 12px;
  }

  .country-item .dial-code {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .country-item.selected .dial-code {
    color: var(--primary);
  }

  .no-results {
    padding: 24px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .phone-input {
    flex: 1;
  }

  .phone-input md-outlined-text-field {
    width: 100%;
    --md-outlined-text-field-container-shape: 8px;
  }

  @media (max-width: 600px) {
    .country-dropdown-wrapper {
      flex: 0 0 95px;
    }
    .country-selector-btn {
      padding: 0 8px 0 10px;
    }
    .country-selector-btn .dial-code {
      margin-left: 4px;
    }
    .flag-icon {
      margin-right: 8px;
    }
  }
</style>
