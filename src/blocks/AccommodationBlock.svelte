<script>
  import { slide } from 'svelte/transition';
  import { formStore } from '../store.svelte.js';
  import { accommodationOptions, ACCOMMODATION_TYPE } from '../constants.js';
  import RadioGroup from '../components/RadioGroup.svelte';
  import NightsGrid from '../components/NightsGrid.svelte';
  import TextArea from '../components/TextArea.svelte';

  let { errors = {} } = $props();

  // Clear nights if booking is not required
  $effect(() => {
    if (formStore.data.accommodation === ACCOMMODATION_TYPE.SELF) {
      formStore.data.nights = [];
    }
  });
</script>

<div class="block-card">
  <h2 class="block-title">Проживание</h2>
  <div class="section-container first-section">
    <div class="section-content">
      <RadioGroup
        label="Потребность в проживании"
        required={true}
        bind:value={formStore.data.accommodation}
        errorText={errors['accommodation']}
        onchange={() => formStore.markTouched('accommodation')}
        options={accommodationOptions}
      />

      {#if formStore.data.accommodation === ACCOMMODATION_TYPE.BOOKING}
        <div transition:slide class="slide-container">
          <NightsGrid
            required={true}
            label="Укажите ночевки"
            bind:values={formStore.data.nights}
            errorText={errors['nights']}
          />
          <TextArea
            label="Дополнительные пожелания к номеру и соседям"
            icon="edit_note"
            placeholder="Напишите здесь всё, что считаете важным..."
            bind:value={formStore.data.accommodationComment}
            errorText={errors['accommodationComment']}
            onblur={() => formStore.markTouched('accommodationComment')}
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
