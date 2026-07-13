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

  /** @type {any} */ let applicantFood;
  /** @type {any} */ let applicantFoodPeriods;
  /** @type {any} */ let applicantAlcohol;
  /** @type {any} */ let applicantAlcoholPeriods;
  
  /** @type {any[]} */ let guestFood = [];
  /** @type {any[]} */ let guestFoodPeriods = [];
  /** @type {any[]} */ let guestAlcohol = [];
  /** @type {any[]} */ let guestAlcoholPeriods = [];

  $: {
    const len = $formStore.guests.length;
    guestFood = guestFood.slice(0, len);
    guestFoodPeriods = guestFoodPeriods.slice(0, len);
    guestAlcohol = guestAlcohol.slice(0, len);
    guestAlcoholPeriods = guestAlcoholPeriods.slice(0, len);
  }

  export function validate(forceTouch = false) {
    let errors = [];
    if (applicantFood && !applicantFood.validate(forceTouch)) errors.push(applicantFood.label + " (Заявитель)");
    if ($formStore.applicant.provisions.food === PROVISION_TYPE.REQUIRED) {
      if (applicantFoodPeriods && !applicantFoodPeriods.validate(forceTouch)) errors.push(applicantFoodPeriods.label + " (Еда, Заявитель)");
    }
    if (applicantAlcohol && !applicantAlcohol.validate(forceTouch)) errors.push(applicantAlcohol.label + " (Заявитель)");
    if ($formStore.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED) {
      if (applicantAlcoholPeriods && !applicantAlcoholPeriods.validate(forceTouch)) errors.push(applicantAlcoholPeriods.label + " (Алкоголь, Заявитель)");
    }

    if ($formStore.applicationType === APPLICATION_TYPE.GROUP && $formStore.groupConditions === GROUP_CONDITIONS.DIFFERENTIAL) {
      for (let i = 0; i < $formStore.guests.length; i++) {
        if (guestFood[i] && !guestFood[i].validate(forceTouch)) errors.push(`${guestFood[i].label} (Гость ${i + 1})`);
        if ($formStore.guests[i].provisions.food === PROVISION_TYPE.REQUIRED) {
          if (guestFoodPeriods[i] && !guestFoodPeriods[i].validate(forceTouch)) errors.push(`${guestFoodPeriods[i].label} (Еда, Гость ${i + 1})`);
        }
        if (guestAlcohol[i] && !guestAlcohol[i].validate(forceTouch)) errors.push(`${guestAlcohol[i].label} (Гость ${i + 1})`);
        if ($formStore.guests[i].provisions.alcohol === PROVISION_TYPE.REQUIRED) {
          if (guestAlcoholPeriods[i] && !guestAlcoholPeriods[i].validate(forceTouch)) errors.push(`${guestAlcoholPeriods[i].label} (Алкоголь, Гость ${i + 1})`);
        }
      }
    }
    return errors;
  }
</script>

<div class="block-card">
  <h2 class="block-title">Обеспечение</h2>

  {#if $formStore.applicationType === APPLICATION_TYPE.INDIVIDUAL || $formStore.groupConditions === GROUP_CONDITIONS.UNIFIED}
    <div class="section-container first-section">
      <h3 class="section-title">{stepNumber}.1. Продукты питания</h3>
      <div class="section-content">
        <div class="provision-item">
          <RadioGroup
            bind:this={applicantFood}
            label="Потребность в питании"
            bind:value={$formStore.applicant.provisions.food}
            options={foodOptions}
            required={true}
          />
          {#if $formStore.applicant.provisions.food === PROVISION_TYPE.REQUIRED}
            <div transition:slide>
              <PeriodsGrid
                bind:this={applicantFoodPeriods}
                required={true}
                bind:values={$formStore.applicant.provisions.foodPeriods}
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
            bind:this={applicantAlcohol}
            label="Потребность в алкоголе"
            bind:value={$formStore.applicant.provisions.alcohol}
            options={alcoholOptions}
            required={true}
          />
          {#if $formStore.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED}
            <div transition:slide>
              <PeriodsGrid
                bind:this={applicantAlcoholPeriods}
                required={true}
                bind:values={$formStore.applicant.provisions.alcoholPeriods}
              />
            </div>
          {/if}
        </div>
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
          bind:this={applicantFood}
          label="Потребность в питании"
          bind:value={$formStore.applicant.provisions.food}
          options={foodOptions}
          required={true}
        />
        {#if $formStore.applicant.provisions.food === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid
              bind:this={applicantFoodPeriods}
              required={true}
              bind:values={$formStore.applicant.provisions.foodPeriods}
            />
          </div>
        {/if}
      </div>
      <div class="provision-item">
        <RadioGroup
          bind:this={applicantAlcohol}
          label="Потребность в алкоголе"
          bind:value={$formStore.applicant.provisions.alcohol}
          options={alcoholOptions}
          required={true}
        />
        {#if $formStore.applicant.provisions.alcohol === PROVISION_TYPE.REQUIRED}
          <div transition:slide>
            <PeriodsGrid
              bind:this={applicantAlcoholPeriods}
              required={true}
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
              bind:this={guestFood[i]}
              label="Потребность в питании"
              bind:value={$formStore.guests[i].provisions.food}
              options={foodOptions}
              required={true}
            />
            {#if $formStore.guests[i].provisions.food === PROVISION_TYPE.REQUIRED}
              <div transition:slide>
                <PeriodsGrid
                  bind:this={guestFoodPeriods[i]}
                  required={true}
                  bind:values={$formStore.guests[i].provisions.foodPeriods}
                />
              </div>
            {/if}
          </div>
          <div class="provision-item">
            <RadioGroup
              bind:this={guestAlcohol[i]}
              label="Потребность в алкоголе"
              bind:value={$formStore.guests[i].provisions.alcohol}
              options={alcoholOptions}
              required={true}
            />
            {#if $formStore.guests[i].provisions.alcohol === PROVISION_TYPE.REQUIRED}
              <div transition:slide>
                <PeriodsGrid
                  bind:this={guestAlcoholPeriods[i]}
                  required={true}
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
