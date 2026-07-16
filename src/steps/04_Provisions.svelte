<script>
  import { slide } from "svelte/transition";
  import { formStore } from "../store.svelte.js";
  import {
    APPLICATION_TYPE,
    GROUP_CONDITIONS,
    PROVISION_TYPE,
    foodOptions,
    alcoholOptions,
    groupedPeriods,
    ERROR_MESSAGES,
  } from "../constants.js";
  import RadioGroup from "../components/fields/RadioGroup.svelte";
  import SelectionGrid from "../components/fields/SelectionGrid.svelte";
  import SubBlock from "../components/layout/SubBlock.svelte";
  import HintBox from "../components/ui/HintBox.svelte";
  import Block from "../components/layout/Block.svelte";
  import Section from "../components/layout/Section.svelte";
  import ExpandableSection from "../components/layout/ExpandableSection.svelte";
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

<Block title="Обеспечение">
  {#if formStore.data.applicationType === APPLICATION_TYPE.INDIVIDUAL || formStore.data.groupConditions === GROUP_CONDITIONS.UNIFIED}
    <Section title={`${stepNumber}.1. Продукты питания`} isFirst={true}>
      <div class="provision-item">
        <RadioGroup
          label="Потребность в питании"
          bind:value={formStore.data.applicant.provisions.food}
          errorText={errors["applicant.provisions.food"]}
          onchange={() => formStore.markTouched("applicant.provisions.food")}
          options={foodOptions}
          required={true}
        />
        <ExpandableSection
          show={formStore.data.applicant.provisions.food ===
            PROVISION_TYPE.REQUIRED}
        >
          <SelectionGrid
            groups={groupedPeriods}
            required={true}
            errorMessageFn={ERROR_MESSAGES.PERIODS}
            bind:values={formStore.data.applicant.provisions.foodPeriods}
            errorText={errors["applicant.provisions.foodPeriods"]}
          />
        </ExpandableSection>
      </div>
    </Section>

    <Section title={`${stepNumber}.2. Алкогольные напитки`}>
      <div class="provision-item">
        <RadioGroup
          label="Потребность в алкоголе"
          bind:value={formStore.data.applicant.provisions.alcohol}
          errorText={errors["applicant.provisions.alcohol"]}
          onchange={() => formStore.markTouched("applicant.provisions.alcohol")}
          options={alcoholOptions}
          required={true}
        />
        <ExpandableSection
          show={formStore.data.applicant.provisions.alcohol ===
            PROVISION_TYPE.REQUIRED}
        >
          <SelectionGrid
            groups={groupedPeriods}
            required={true}
            errorMessageFn={ERROR_MESSAGES.PERIODS}
            bind:values={formStore.data.applicant.provisions.alcoholPeriods}
            errorText={errors["applicant.provisions.alcoholPeriods"]}
          />
        </ExpandableSection>
      </div>
    </Section>
  {:else}
    <HintBox>Укажите потребности для каждого участника группы отдельно</HintBox>

    <SubBlock
      title={`Для ${formStore.data.applicant.nickname || "Заявителя"}`}
      stickyLevel={2}
    >
      <div class="provision-item">
        <RadioGroup
          label="Потребность в питании"
          bind:value={formStore.data.applicant.provisions.food}
          errorText={errors["applicant.provisions.food"]}
          onchange={() => formStore.markTouched("applicant.provisions.food")}
          options={foodOptions}
          required={true}
        />
        <ExpandableSection
          show={formStore.data.applicant.provisions.food ===
            PROVISION_TYPE.REQUIRED}
        >
          <SelectionGrid
            groups={groupedPeriods}
            required={true}
            errorMessageFn={ERROR_MESSAGES.PERIODS}
            bind:values={formStore.data.applicant.provisions.foodPeriods}
            errorText={errors["applicant.provisions.foodPeriods"]}
          />
        </ExpandableSection>
      </div>
      <div class="provision-item">
        <RadioGroup
          label="Потребность в алкоголе"
          bind:value={formStore.data.applicant.provisions.alcohol}
          errorText={errors["applicant.provisions.alcohol"]}
          onchange={() => formStore.markTouched("applicant.provisions.alcohol")}
          options={alcoholOptions}
          required={true}
        />
        <ExpandableSection
          show={formStore.data.applicant.provisions.alcohol ===
            PROVISION_TYPE.REQUIRED}
        >
          <SelectionGrid
            groups={groupedPeriods}
            required={true}
            errorMessageFn={ERROR_MESSAGES.PERIODS}
            bind:values={formStore.data.applicant.provisions.alcoholPeriods}
            errorText={errors["applicant.provisions.alcoholPeriods"]}
          />
        </ExpandableSection>
      </div>
    </SubBlock>

    {#each formStore.data.guests as guest, i}
      <ExpandableSection show={true}>
        <SubBlock
          title={`Для ${guest.firstName || `Гостя #${i + 1}`}`}
          stickyLevel={2}
        >
          <div class="provision-item">
            <RadioGroup
              label="Потребность в питании"
              bind:value={formStore.data.guests[i].provisions.food}
              errorText={errors[`guests.${i}.provisions.food`]}
              onchange={() =>
                formStore.markTouched(`guests.${i}.provisions.food`)}
              options={foodOptions}
              required={true}
            />
            <ExpandableSection
              show={formStore.data.guests[i].provisions.food ===
                PROVISION_TYPE.REQUIRED}
            >
              <SelectionGrid
                groups={groupedPeriods}
                required={true}
                errorMessageFn={ERROR_MESSAGES.PERIODS}
                bind:values={formStore.data.guests[i].provisions.foodPeriods}
                errorText={errors[`guests.${i}.provisions.foodPeriods`]}
              />
            </ExpandableSection>
          </div>
          <div class="provision-item">
            <RadioGroup
              label="Потребность в алкоголе"
              bind:value={formStore.data.guests[i].provisions.alcohol}
              errorText={errors[`guests.${i}.provisions.alcohol`]}
              onchange={() =>
                formStore.markTouched(`guests.${i}.provisions.alcohol`)}
              options={alcoholOptions}
              required={true}
            />
            <ExpandableSection
              show={formStore.data.guests[i].provisions.alcohol ===
                PROVISION_TYPE.REQUIRED}
            >
              <SelectionGrid
                groups={groupedPeriods}
                required={true}
                errorMessageFn={ERROR_MESSAGES.PERIODS}
                bind:values={formStore.data.guests[i].provisions.alcoholPeriods}
                errorText={errors[`guests.${i}.provisions.alcoholPeriods`]}
              />
            </ExpandableSection>
          </div>
        </SubBlock>
      </ExpandableSection>
    {/each}
  {/if}
</Block>

<style>
  .provision-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
