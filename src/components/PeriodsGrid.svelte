<script>
  import { groupedPeriods, ERROR_MESSAGES } from "../constants.js";
  import HintBox from "./HintBox.svelte";
  import "@material/web/icon/icon.js";

  /** @type {string[]} */
  export let values = [];
  /** @type {string} */
  export const label = "Периоды";

  /** @param {string} id */
  function handleToggle(id) {
    if (values.includes(id)) {
      values = values.filter((v) => v !== id);
    } else {
      values = [...values, id];
    }
  }

  /** @param {string} label */
  function getIcon(label) {
    // Return different Material icons based on time of day
    return label === "Утро" ? "wb_sunny" : "nightlight_round";
  }

  export let required = false;
  let error = false;
  /** @type {{prefix: string, label: string, suffix: string} | null} */
  let errorMsg = null;

  export function validate() {
    if (required && (!values || values.length === 0)) {
      error = true;
      errorMsg = ERROR_MESSAGES.PERIODS(label || 'Значение');
    } else {
      error = false;
      errorMsg = null;
    }
    return !error;
  }

  $: {
    if (error && values.length > 0) {
      validate();
    }
  }
</script>

<div class="form-group">
  {#each groupedPeriods as group}
    <div class="form-group">
      <div class="label-container">
        <div class="group-label">{group.day}</div>
      </div>
      <div class="cards-grid">
        {#each group.periods as period}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class="period-card"
            class:selected={values.includes(period.id)}
            on:click={() => handleToggle(period.id)}
          >
            <div class="card-icon">
              <md-icon>{getIcon(period.label)}</md-icon>
            </div>
            <div class="card-content">
              <span class="card-label">{period.label}</span>
              <span class="card-helper">{period.helperText}</span>
            </div>
            <div class="card-checkbox">
              {#if values.includes(period.id)}
                <md-icon>check_circle</md-icon>
              {:else}
                <md-icon>radio_button_unchecked</md-icon>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
  {#if error && errorMsg}
    <div class="error-wrapper">
      <HintBox type="error">
        {errorMsg.prefix}<strong class="text-primary">{errorMsg.label}</strong>{errorMsg.suffix}
      </HintBox>
    </div>
  {/if}
</div>

<style>

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  .period-card {
    display: flex;
    align-items: center;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition:
      border-color 0.2s,
      box-shadow 0.2s,
      background-color 0.2s;
    user-select: none;
  }

  .period-card:hover {
    border-color: var(--primary-hover);
  }

  .period-card.selected {
    border-color: var(--primary);
    background-color: rgba(255, 165, 0, 0.05);
    box-shadow: 0 0 0 1px var(--primary); /* Mimic focus ring */
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    color: var(--text-secondary);
    transition: color 0.2s;
  }

  .period-card.selected .card-icon {
    color: var(--primary);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .card-label {
    font-weight: 600;
    color: var(--text-primary);
  }

  .card-helper {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .card-checkbox {
    display: flex;
    align-items: center;
    color: var(--text-secondary);
    transition: color 0.2s;
  }

  .period-card.selected .card-checkbox {
    color: var(--primary);
  }

  .error-wrapper {
    margin-top: 0.5rem;
  }
</style>
