<script>
  import { slide } from 'svelte/transition';
  import { formStore } from '../store.js';
  import { nightsList, accommodationOptions, ACCOMMODATION_TYPE } from '../constants.js';
  import RadioGroup from '../components/RadioGroup.svelte';
  import CheckboxGrid from '../components/CheckboxGrid.svelte';
  import TextArea from '../components/TextArea.svelte';


</script>

<div class="block-card">
  <h2 class="block-title">Проживание</h2>
  <RadioGroup label="Потребность в проживании" required={true} bind:value={$formStore.accommodation} options={accommodationOptions} />

  {#if $formStore.accommodation === ACCOMMODATION_TYPE.BOOKING}
    <div transition:slide>
      <CheckboxGrid label="Укажите ночевки" bind:values={$formStore.nights} options={nightsList} />
      <div class="mt-4">
        <TextArea 
          label="Дополнительные пожелания к номеру и соседям" 
          icon="edit_note"
          placeholder="Напишите здесь всё, что считаете важным..."
          bind:value={$formStore.accommodationComment} 
        />
      </div>
    </div>
  {/if}
</div>

<style>


  .mt-4 {
    margin-top: 1rem;
  }
</style>
