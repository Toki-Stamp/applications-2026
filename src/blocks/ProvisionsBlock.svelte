<script>
  import { slide } from "svelte/transition";
  import { formStore } from "../store.js";
  import {
    APPLICATION_TYPE,
    GROUP_CONDITIONS,
    PROVISION_TYPE,
    periods,
    foodOptions,
    alcoholOptions,
  } from "../constants.js";
  import RadioGroup from "../components/RadioGroup.svelte";
  import PeriodsGrid from "../components/PeriodsGrid.svelte";
  import SubBlockCard from "../components/SubBlockCard.svelte";
  import "@material/web/icon/icon.js";

  export let stepNumber;

  // Clear periods when "none" is selected
  $: if ($formStore.applicant.provisions.food === PROVISION_TYPE.NONE) {
    $formStore.applicant.provisions.foodPeriods = [];
  }
  $: if ($formStore.applicant.provisions.alcohol === PROVISION_TYPE.NONE) {
    $formStore.applicant.provisions.alcoholPeriods = [];
  }

  $: {
    for (let i = 0; i < $formStore.guests.length; i++) {
      const guest = $formStore.guests[i];
      if (guest.provisions.food === PROVISION_TYPE.NONE) {
        $formStore.guests[i].provisions.foodPeriods = [];
      }
      if (guest.provisions.alcohol === PROVISION_TYPE.NONE) {
        $formStore.guests[i].provisions.alcoholPeriods = [];
      }
    }
  }
</script>

<div class="block-card">
  <h2 class="block-title">Обеспечение</h2>

  {#if $formStore.applicationType === APPLICATION_TYPE.INDIVIDUAL || $formStore.groupConditions === GROUP_CONDITIONS.UNIFIED}
    <div class="section-container first-section">
      <div class="form-group">
        <h3 class="section-title">{stepNumber}.1. Продукты питания</h3>
        <RadioGroup
          label="Потребность в питании"
          bind:value={$formStore.applicant.provisions.food}
          options={foodOptions}
        />
        {#if $formStore.applicant.provisions.food === PROVISION_TYPE.REQUIRED}
          <div transition:slide style="margin-top: 1.5rem;">
            <PeriodsGrid
              bind:values={$formStore.applicant.provisions.foodPeriods}
            />
          </div>
        {/if}
      </div>
    </div>

    <div class="section-container">
      <div class="form-group">
        <h3 class="section-title">{stepNumber}.2. Алкогольные напитки</h3>
        <RadioGroup
          label="Потребность в алкоголе"
          bind:value={$formStore.applicant.provisions.alcohol}
          options={alcoholOptions}
        />
        {#if $formStore.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED}
          <div transition:slide style="margin-top: 1.5rem;">
            <PeriodsGrid
              bind:values={$formStore.applicant.provisions.alcoholPeriods}
            />
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="hint-box">
      <md-icon class="hint-icon">info</md-icon>
      <span>Укажите потребности для каждого участника группы отдельно</span>
    </div>

    <SubBlockCard
      title={`Для ${$formStore.applicant.nickname || "Заявителя"}`}
      stickyLevel={2}
    >
      <div class="form-group">
        <RadioGroup
          label="Потребность в питании"
          bind:value={$formStore.applicant.provisions.food}
          options={foodOptions}
        />
        {#if $formStore.applicant.provisions.food === PROVISION_TYPE.REQUIRED}
          <div transition:slide style="margin-top: 1.5rem;">
            <PeriodsGrid
              bind:values={$formStore.applicant.provisions.foodPeriods}
            />
          </div>
        {/if}
      </div>
      <div class="form-group">
        <RadioGroup
          label="Потребность в алкоголе"
          bind:value={$formStore.applicant.provisions.alcohol}
          options={alcoholOptions}
        />
        {#if $formStore.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED}
          <div transition:slide style="margin-top: 1.5rem;">
            <PeriodsGrid
              bind:values={$formStore.applicant.provisions.alcoholPeriods}
            />
          </div>
        {/if}
      </div>
    </SubBlockCard>

    {#each $formStore.guests as guest, i}
      <div transition:slide>
        <SubBlockCard
          title={`Для ${guest.firstName || `Гостя #${i + 1}`}`}
          stickyLevel={2}
        >
          <div class="form-group">
            <RadioGroup
              label="Потребность в питании"
              bind:value={$formStore.guests[i].provisions.food}
              options={foodOptions}
            />
            {#if $formStore.guests[i].provisions.food === PROVISION_TYPE.REQUIRED}
              <div transition:slide style="margin-top: 1.5rem;">
                <PeriodsGrid
                  bind:values={$formStore.guests[i].provisions.foodPeriods}
                />
              </div>
            {/if}
          </div>
          <div class="form-group">
            <RadioGroup
              label="Потребность в алкоголе"
              bind:value={$formStore.guests[i].provisions.alcohol}
              options={alcoholOptions}
            />
            {#if $formStore.guests[i].provisions.alcohol === PROVISION_TYPE.REQUIRED}
              <div transition:slide style="margin-top: 1.5rem;">
                <PeriodsGrid
                  bind:values={$formStore.guests[i].provisions.alcoholPeriods}
                />
              </div>
            {/if}
          </div>
        </SubBlockCard>
      </div>
    {/each}
  {/if}
</div>

<style>
  :global(.form-group > .container) {
    margin-bottom: 0 !important;
  }

  .hint-box {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-left: 3px solid var(--primary);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 1.5rem;
    gap: 0.75rem;
    color: var(--text-primary);
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .hint-icon {
    color: var(--primary);
    font-size: 1.8rem;
    flex-shrink: 0;
  }

  .form-group {
    margin-bottom: 1rem;
  }
</style>
