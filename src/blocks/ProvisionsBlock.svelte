<script>
  import { slide } from "svelte/transition";
  import { formStore } from "../store.js";
  import {
    APPLICATION_TYPE,
    GROUP_CONDITIONS,
    PROVISION_TYPE,
    foodOptions,
    alcoholOptions,
  } from "../constants.js";
  import RadioGroup from "../components/RadioGroup.svelte";
  import PeriodsGrid from "../components/PeriodsGrid.svelte";
  import SubBlockCard from "../components/SubBlockCard.svelte";
  import HintBox from "../components/HintBox.svelte";
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
      <h3 class="section-title">{stepNumber}.1. Продукты питания</h3>
      <div class="provision-item">
        <RadioGroup
          label="Потребность в питании"
          bind:value={$formStore.applicant.provisions.food}
          options={foodOptions}
          required={true}
        />
        {#if $formStore.applicant.provisions.food === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid
              bind:values={$formStore.applicant.provisions.foodPeriods}
            />
          </div>
        {/if}
      </div>
    </div>

    <div class="section-container">
      <h3 class="section-title">{stepNumber}.2. Алкогольные напитки</h3>
      <div class="provision-item">
        <RadioGroup
          label="Потребность в алкоголе"
          bind:value={$formStore.applicant.provisions.alcohol}
          options={alcoholOptions}
          required={true}
        />
        {#if $formStore.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid
              bind:values={$formStore.applicant.provisions.alcoholPeriods}
            />
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <HintBox>Укажите потребности для каждого участника группы отдельно</HintBox>

    <SubBlockCard
      title={`Для ${$formStore.applicant.nickname || "Заявителя"}`}
      stickyLevel={2}
    >
      <div class="provision-item">
        <RadioGroup
          label="Потребность в питании"
          bind:value={$formStore.applicant.provisions.food}
          options={foodOptions}
          required={true}
        />
        {#if $formStore.applicant.provisions.food === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid
              bind:values={$formStore.applicant.provisions.foodPeriods}
            />
          </div>
        {/if}
      </div>
      <div class="provision-item">
        <RadioGroup
          label="Потребность в алкоголе"
          bind:value={$formStore.applicant.provisions.alcohol}
          options={alcoholOptions}
          required={true}
        />
        {#if $formStore.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
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
          <div class="provision-item">
            <RadioGroup
              label="Потребность в питании"
              bind:value={$formStore.guests[i].provisions.food}
              options={foodOptions}
            />
            {#if $formStore.guests[i].provisions.food === PROVISION_TYPE.REQUIRED}
              <div transition:slide>
                <PeriodsGrid
                  bind:values={$formStore.guests[i].provisions.foodPeriods}
                />
              </div>
            {/if}
          </div>
          <div class="provision-item">
            <RadioGroup
              label="Потребность в алкоголе"
              bind:value={$formStore.guests[i].provisions.alcohol}
              options={alcoholOptions}
            />
            {#if $formStore.guests[i].provisions.alcohol === PROVISION_TYPE.REQUIRED}
              <div transition:slide>
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
  .provision-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
