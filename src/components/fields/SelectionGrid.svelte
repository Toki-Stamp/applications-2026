<script>
  import HintBox from "../ui/HintBox.svelte";
  import "@material/web/icon/icon.js";

  let {
    values = $bindable([]),
    label = '',
    required = false,
    errorText = '',
    groups = [], // array of { day?: string, items: { id, label, helperText, icon }[] }
    errorMessageFn = null // function to generate error message object {prefix, label, suffix}
  } = $props();

  function handleToggle(id) {
    if (values.includes(id)) {
      values = values.filter((v) => v !== id);
    } else {
      values = [...values, id];
    }
  }

  const hasError = $derived(!!errorText);
  const errorMsg = $derived(hasError && errorMessageFn ? errorMessageFn(label || 'Значение') : null);
</script>

<div class="form-group">
  {#if label && !groups[0]?.day}
    <div class="label-container">
      <div class="group-label">{label}</div>
    </div>
  {/if}

  {#each groups as group}
    <div class="form-group">
      {#if group.day}
        <div class="label-container">
          <div class="group-label">{group.day}</div>
        </div>
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

  {#if hasError && errorMsg}
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
    margin-bottom: 1rem;
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

  .error-wrapper {
    margin-top: 0.5rem;
  }
</style>
