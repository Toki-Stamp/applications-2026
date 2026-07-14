<script>
  import { slide } from "svelte/transition";
  import { formStore } from "../store.svelte.js";
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

  let { stepNumber, errors = {} } = $props();

  // Clear periods when "none" is selected
  $effect(() => {
    if (formStore.data.applicant.provisions.food === PROVISION_TYPE.NONE) {
      formStore.data.applicant.provisions.foodPeriods = [];
    }
    if (formStore.data.applicant.provisions.alcohol === PROVISION_TYPE.NONE) {
      formStore.data.applicant.provisions.alcoholPeriods = [];
    }
    for (let i = 0; i < formStore.data.guests.length; i++) {
      if (formStore.data.guests[i].provisions.food === PROVISION_TYPE.NONE) {
        formStore.data.guests[i].provisions.foodPeriods = [];
      }
      if (formStore.data.guests[i].provisions.alcohol === PROVISION_TYPE.NONE) {
        formStore.data.guests[i].provisions.alcoholPeriods = [];
      }
    }
  });
</script>

<div class="block-card">
  <h2 class="block-title">Обеспечение</h2>

  {#if formStore.data.applicationType === APPLICATION_TYPE.INDIVIDUAL || formStore.data.groupConditions === GROUP_CONDITIONS.UNIFIED}
    <div class="section-container first-section">
      <h3 class="section-title">{stepNumber}.1. Продукты питания</h3>
      <div class="section-content">
        <div class="provision-item">
          <RadioGroup
            label="Потребность в питании"
            bind:value={formStore.data.applicant.provisions.food}
            errorText={errors['applicant.provisions.food']}
            onchange={() => formStore.markTouched('applicant.provisions.food')}
            options={foodOptions}
            required={true}
          />
          {#if formStore.data.applicant.provisions.food === PROVISION_TYPE.REQUIRED}
            <div transition:slide>
              <PeriodsGrid
                required={true}
                bind:values={formStore.data.applicant.provisions.foodPeriods}
                errorText={errors['applicant.provisions.foodPeriods']}
              />
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="section-container">
      <h3 class="section-title">{stepNumber}.2. Алкогольные напитки</h3>
      <div class="section-content">
        <div class="provision-item">
          <RadioGroup
            label="Потребность в алкоголе"
            bind:value={formStore.data.applicant.provisions.alcohol}
            errorText={errors['applicant.provisions.alcohol']}
            onchange={() => formStore.markTouched('applicant.provisions.alcohol')}
            options={alcoholOptions}
            required={true}
          />
          {#if formStore.data.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED}
            <div transition:slide>
              <PeriodsGrid
                required={true}
                bind:values={formStore.data.applicant.provisions.alcoholPeriods}
                errorText={errors['applicant.provisions.alcoholPeriods']}
              />
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <HintBox>Укажите потребности для каждого участника группы отдельно</HintBox>

    <SubBlockCard
      title={`Для ${formStore.data.applicant.nickname || "Заявителя"}`}
      stickyLevel={2}
    >
      <div class="provision-item">
        <RadioGroup
          label="Потребность в питании"
          bind:value={formStore.data.applicant.provisions.food}
          errorText={errors['applicant.provisions.food']}
          onchange={() => formStore.markTouched('applicant.provisions.food')}
          options={foodOptions}
          required={true}
        />
        {#if formStore.data.applicant.provisions.food === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid
              required={true}
              bind:values={formStore.data.applicant.provisions.foodPeriods}
              errorText={errors['applicant.provisions.foodPeriods']}
            />
          </div>
        {/if}
      </div>
      <div class="provision-item">
        <RadioGroup
          label="Потребность в алкоголе"
          bind:value={formStore.data.applicant.provisions.alcohol}
          errorText={errors['applicant.provisions.alcohol']}
          onchange={() => formStore.markTouched('applicant.provisions.alcohol')}
          options={alcoholOptions}
          required={true}
        />
        {#if formStore.data.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid
              required={true}
              bind:values={formStore.data.applicant.provisions.alcoholPeriods}
              errorText={errors['applicant.provisions.alcoholPeriods']}
            />
          </div>
        {/if}
      </div>
    </SubBlockCard>

    {#each formStore.data.guests as guest, i}
      <div transition:slide>
        <SubBlockCard
          title={`Для ${guest.firstName || `Гостя #${i + 1}`}`}
          stickyLevel={2}
        >
          <div class="provision-item">
            <RadioGroup
              label="Потребность в питании"
              bind:value={formStore.data.guests[i].provisions.food}
              errorText={errors[`guests.${i}.provisions.food`]}
              onchange={() => formStore.markTouched(`guests.${i}.provisions.food`)}
              options={foodOptions}
              required={true}
            />
            {#if formStore.data.guests[i].provisions.food === PROVISION_TYPE.REQUIRED}
              <div transition:slide>
                <PeriodsGrid
                  required={true}
                  bind:values={formStore.data.guests[i].provisions.foodPeriods}
                  errorText={errors[`guests.${i}.provisions.foodPeriods`]}
                />
              </div>
            {/if}
          </div>
          <div class="provision-item">
            <RadioGroup
              label="Потребность в алкоголе"
              bind:value={formStore.data.guests[i].provisions.alcohol}
              errorText={errors[`guests.${i}.provisions.alcohol`]}
              onchange={() => formStore.markTouched(`guests.${i}.provisions.alcohol`)}
              options={alcoholOptions}
              required={true}
            />
            {#if formStore.data.guests[i].provisions.alcohol === PROVISION_TYPE.REQUIRED}
              <div transition:slide>
                <PeriodsGrid
                  required={true}
                  bind:values={formStore.data.guests[i].provisions.alcoholPeriods}
                  errorText={errors[`guests.${i}.provisions.alcoholPeriods`]}
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
