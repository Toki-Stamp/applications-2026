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
</script>

<div class="block-card">
  <h2 class="block-title">Проживание</h2>
  <div class="section-container first-section">
    <RadioGroup label="Потребность в проживании" required={true} bind:value={$formStore.accommodation} options={accommodationOptions} />

    {#if $formStore.accommodation === ACCOMMODATION_TYPE.BOOKING}
      <div transition:slide class="slide-container">
        <NightsGrid label="Укажите ночевки" bind:values={$formStore.nights} />
        <TextArea 
          label="Дополнительные пожелания к номеру и соседям" 
          icon="edit_note"
          placeholder="Напишите здесь всё, что считаете важным..."
          bind:value={$formStore.accommodationComment} 
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .slide-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
