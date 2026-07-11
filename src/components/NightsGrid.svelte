<script>
  import { nightsList } from '../constants.js';
  import '@material/web/icon/icon.js';

  /** @type {string[]} */
  export let values = [];
  /** @type {string} */
  export let label = '';

  /** @param {string} id */
  function handleToggle(id) {
    if (values.includes(id)) {
      values = values.filter(v => v !== id);
    } else {
      values = [...values, id];
    }
  }
</script>

<div class="form-group">
  {#if label}
    <div class="label-container">
      <div class="group-label">{label}</div>
    </div>
  {/if}
  <div class="cards-grid">
    {#each nightsList as night}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div 
        class="night-card"
        class:selected={values.includes(night.id)}
        on:click={() => handleToggle(night.id)}
      >
        <div class="card-icon">
          <md-icon>bedtime</md-icon>
        </div>
        <div class="card-content">
          <span class="card-label">{night.label}</span>
        </div>
        <div class="card-checkbox">
          {#if values.includes(night.id)}
            <md-icon>check_circle</md-icon>
          {:else}
            <md-icon>radio_button_unchecked</md-icon>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>

  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }
  
  .night-card {
    display: flex;
    align-items: center;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
    user-select: none;
  }
  
  .night-card:hover {
    border-color: var(--primary-hover);
  }
  
  .night-card.selected {
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
  
  .night-card.selected .card-icon {
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
  
  .card-checkbox {
    display: flex;
    align-items: center;
    color: var(--text-secondary);
    transition: color 0.2s;
  }
  
  .night-card.selected .card-checkbox {
    color: var(--primary);
  }
</style>
