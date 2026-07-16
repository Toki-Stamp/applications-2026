<script>
  import HintBox from "../ui/HintBox.svelte";
  import "@material/web/icon/icon.js";

  import FieldLabel from "./FieldLabel.svelte";

  let {
    values = $bindable([]),
    label = "",
    required = false,
    errorText = "",
    groups = [],
    errorMessageFn = null, // function to generate error message object {prefix, label, suffix}
  } = $props();

  /** @param {string | number} id */
  function handleToggle(id) {
    if (values.includes(id)) {
      values = values.filter((v) => v !== id);
    } else {
      values = [...values, id];
    }
  }

  const hasError = $derived(!!errorText);
  const errorMsg = $derived(
    hasError && errorMessageFn ? errorMessageFn(label || "Значение") : null,
  );
</script>

<div class="selection-grid-root">
  <div class="selection-content">
    {#if label && !groups[0]?.day}
      <FieldLabel {label} {required} />
    {/if}

    <div class="groups-container">
      {#each groups as group}
        <div class="group-container">
          {#if group.day}
            <FieldLabel label={group.day} />
          {/if}
          <div class="cards-grid">
            {#each group.items as item}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <div
                class="period-card"
                class:selected={values.includes(item.id)}
                onclick={() => handleToggle(item.id)}
              >
                {#if item.icon}
                  <div class="card-icon">
                    <md-icon>{item.icon}</md-icon>
                  </div>
                {/if}
                <div class="card-content">
                  <span class="card-label">{item.label}</span>
                  {#if item.helperText}
                    <span class="card-helper">{item.helperText}</span>
                  {/if}
                </div>
                <div class="card-checkbox">
                  {#if values.includes(item.id)}
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
    </div>
  </div>

  {#if hasError}
    <div class="error-wrapper">
      <HintBox type="error">
        {#if errorMsg}
          {errorMsg.prefix}<strong class="text-primary">{errorMsg.label}</strong
          >{errorMsg.suffix}
        {:else}
          {errorText}
        {/if}
      </HintBox>
    </div>
  {/if}
</div>

<style>
  .selection-grid-root {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .selection-content,
  .group-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .groups-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 500px) {
    .cards-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .period-card {
    display: flex;
    align-items: center;
    background: transparent;
    border: 1px solid var(--input-border-color);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    min-height: 56px;
    box-sizing: border-box;
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
    line-height: 1.4;
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
</style>
