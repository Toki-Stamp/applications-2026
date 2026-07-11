<script>
  import { slide } from 'svelte/transition';
  import { formStore } from '../store.js';
  import { APPLICATION_TYPE, GROUP_CONDITIONS, PROVISION_TYPE, periods, foodOptions, alcoholOptions } from '../constants.js';
  import RadioGroup from '../components/RadioGroup.svelte';
  import PeriodsGrid from '../components/PeriodsGrid.svelte';
  import SubBlockCard from '../components/SubBlockCard.svelte';

  export let stepNumber;
</script>

<div class="block-card">
  <h2 class="block-title">Обеспечение</h2>
  
  {#if $formStore.applicationType === APPLICATION_TYPE.INDIVIDUAL || $formStore.groupConditions === GROUP_CONDITIONS.UNIFIED}
    <div class="section-container first-section">
      <div class="form-group">
        <h3 class="section-title">{stepNumber}.1. Продукты питания</h3>
        <RadioGroup label="Потребность в питании" bind:value={$formStore.applicant.provisions.food} options={foodOptions} />
        {#if $formStore.applicant.provisions.food === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid bind:values={$formStore.applicant.provisions.foodPeriods} />
          </div>
        {/if}
      </div>
    </div>

    <div class="section-container">
      <div class="form-group">
        <h3 class="section-title">{stepNumber}.2. Алкогольные напитки</h3>
        <RadioGroup label="Потребность в алкоголе" bind:value={$formStore.applicant.provisions.alcohol} options={alcoholOptions} />
        {#if $formStore.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid bind:values={$formStore.applicant.provisions.alcoholPeriods} />
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <p class="hint">Укажите потребности для каждого участника группы отдельно.</p>
    
    <SubBlockCard title={`Для ${$formStore.applicant.nickname || 'Заявителя'}`} stickyLevel={2}>
      <div class="form-group">
        <RadioGroup label="Потребность в питании" bind:value={$formStore.applicant.provisions.food} options={foodOptions} />
        {#if $formStore.applicant.provisions.food === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid bind:values={$formStore.applicant.provisions.foodPeriods} />
          </div>
        {/if}
      </div>
      <div class="form-group">
        <RadioGroup label="Потребность в алкоголе" bind:value={$formStore.applicant.provisions.alcohol} options={alcoholOptions} />
        {#if $formStore.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid bind:values={$formStore.applicant.provisions.alcoholPeriods} />
          </div>
        {/if}
      </div>
    </SubBlockCard>

    {#each $formStore.guests as guest, i}
      <div transition:slide>
        <SubBlockCard title={`Для ${guest.firstName || `Гостя #${i+1}`}`} stickyLevel={2}>
          <div class="form-group">
            <RadioGroup label="Потребность в питании" bind:value={$formStore.guests[i].provisions.food} options={foodOptions} />
            {#if $formStore.guests[i].provisions.food === PROVISION_TYPE.REQUIRED}
              <div transition:slide>
                <PeriodsGrid bind:values={$formStore.guests[i].provisions.foodPeriods} />
              </div>
            {/if}
          </div>
          <div class="form-group">
            <RadioGroup label="Потребность в алкоголе" bind:value={$formStore.guests[i].provisions.alcohol} options={alcoholOptions} />
            {#if $formStore.guests[i].provisions.alcohol === PROVISION_TYPE.REQUIRED}
              <div transition:slide>
                <PeriodsGrid bind:values={$formStore.guests[i].provisions.alcoholPeriods} />
              </div>
            {/if}
          </div>
        </SubBlockCard>
      </div>
    {/each}
  {/if}
</div>

<style>

  .hint {
    color: var(--text-secondary);
    font-style: italic;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }
</style>
