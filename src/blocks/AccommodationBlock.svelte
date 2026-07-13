<script>
  import { slide } from 'svelte/transition';
  import { formStore } from '../store.js';
  import { accommodationOptions, ACCOMMODATION_TYPE } from '../constants.js';
  import RadioGroup from '../components/RadioGroup.svelte';
  import NightsGrid from '../components/NightsGrid.svelte';
  import TextArea from '../components/TextArea.svelte';

  // Clear nights if booking is not required
  $: if ($formStore.accommodation === ACCOMMODATION_TYPE.SELF) {
    $formStore.nights = [];
  }

  /** @type {any} */ let accInput;
  /** @type {any} */ let nightsInput;
  /** @type {any} */ let commentInput;

  export function validate(forceTouch = false) {
    let errors = [];
    if (accInput && !accInput.validate(forceTouch)) errors.push(accInput.label || "Размещение");
    if ($formStore.accommodation === ACCOMMODATION_TYPE.BOOKING) {
      if (nightsInput && !nightsInput.validate(forceTouch)) errors.push(nightsInput.label || "Ночевки");
      if (commentInput && typeof commentInput.validate === 'function' && !commentInput.validate(forceTouch)) errors.push(commentInput.label);
    }
    return errors;
  }
</script>

<div class="block-card">
  <h2 class="block-title">Проживание</h2>
  <div class="section-container first-section">
    <div class="section-content">
      <RadioGroup bind:this={accInput} label="Потребность в проживании" required={true} bind:value={$formStore.accommodation} options={accommodationOptions} />

      {#if $formStore.accommodation === ACCOMMODATION_TYPE.BOOKING}
        <div transition:slide class="slide-container">
          <NightsGrid bind:this={nightsInput} required={true} label="Укажите ночевки" bind:values={$formStore.nights} />
          <TextArea 
            bind:this={commentInput}
            label="Дополнительные пожелания к номеру и соседям" 
            icon="edit_note"
            placeholder="Напишите здесь всё, что считаете важным..."
            bind:value={$formStore.accommodationComment} 
          />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .slide-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
