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
  } from "../constants.js";
  import RadioGroup from "../components/fields/RadioGroup.svelte";
  import SelectionGrid from "../components/fields/SelectionGrid.svelte";
  import TextArea from "../components/fields/TextArea.svelte";
  import SubBlock from "../components/layout/SubBlock.svelte";
  import HintBox from "../components/ui/HintBox.svelte";
  import Block from "../components/layout/Block.svelte";
  import Section from "../components/layout/Section.svelte";
  import ExpandableSection from "../components/layout/ExpandableSection.svelte";
  import "@material/web/icon/icon.js";
  import { dict } from "../locales/ru.js";

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

<Block title={dict.steps.provisions.title} icon="restaurant">
  {#if formStore.data.applicationType === APPLICATION_TYPE.INDIVIDUAL || formStore.data.groupConditions === GROUP_CONDITIONS.UNIFIED}
    <Section title={dict.steps.provisions.foodTitle} isFirst={true}>
      <div class="provision-item">
        <RadioGroup
          label={dict.steps.provisions.foodLabel}
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
            errorMessageFn={() => dict.errors.periods}
            bind:values={formStore.data.applicant.provisions.foodPeriods}
            errorText={errors["applicant.provisions.foodPeriods"]}
          />
        </ExpandableSection>
      </div>
    </Section>

    <Section title={dict.steps.provisions.alcoholTitle}>
      <div class="provision-item">
        <RadioGroup
          label={dict.steps.provisions.alcoholLabel}
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
            errorMessageFn={() => dict.errors.periods}
            bind:values={formStore.data.applicant.provisions.alcoholPeriods}
            errorText={errors["applicant.provisions.alcoholPeriods"]}
          />
        </ExpandableSection>
      </div>
    </Section>

    <Section title={dict.steps.provisions.commentTitle}>
      <TextArea
        label={dict.steps.provisions.commentLabel}
        icon="edit_note"
        placeholder={dict.steps.provisions.commentPlaceholder}
        helperText={dict.steps.provisions.commentHint}
        bind:value={formStore.data.applicant.provisions.comment}
        errorText={errors["applicant.provisions.comment"]}
        onblur={() => formStore.markTouched("applicant.provisions.comment")}
      />
    </Section>
  {:else}
    <HintBox>{dict.steps.provisions.diffHint}</HintBox>

    <Section
      title={dict.steps.provisions.forApplicant(
        formStore.data.applicant.nickname || "Заявителя",
      )}
    >
      <div class="provision-item">
        <RadioGroup
          label={dict.steps.provisions.foodLabel}
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
            errorMessageFn={() => dict.errors.periods}
            bind:values={formStore.data.applicant.provisions.foodPeriods}
            errorText={errors["applicant.provisions.foodPeriods"]}
          />
        </ExpandableSection>
      </div>
      <div class="provision-item">
        <RadioGroup
          label={dict.steps.provisions.alcoholLabel}
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
            errorMessageFn={() => dict.errors.periods}
            bind:values={formStore.data.applicant.provisions.alcoholPeriods}
            errorText={errors["applicant.provisions.alcoholPeriods"]}
          />
        </ExpandableSection>
      </div>

      <TextArea
        label={dict.steps.provisions.commentLabel}
        icon="edit_note"
        placeholder={dict.steps.provisions.commentPlaceholder}
        helperText={dict.steps.provisions.commentHint}
        bind:value={formStore.data.applicant.provisions.comment}
        errorText={errors["applicant.provisions.comment"]}
        onblur={() => formStore.markTouched("applicant.provisions.comment")}
      />
    </Section>

    {#if formStore.data.guests.length > 0}
      <ExpandableSection show={true}>
        <Section title={dict.steps.personalData.groupTitle}>
          {#each formStore.data.guests as guest, i}
            <ExpandableSection show={true}>
              <SubBlock
                title={dict.steps.provisions.forGuest(
                  guest.firstName || `Гостя #${i + 1}`,
                )}
              >
                <div class="provision-item">
                  <RadioGroup
                    label={dict.steps.provisions.foodLabel}
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
                      errorMessageFn={() => dict.errors.periods}
                      bind:values={formStore.data.guests[i].provisions.foodPeriods}
                      errorText={errors[`guests.${i}.provisions.foodPeriods`]}
                    />
                  </ExpandableSection>
                </div>
                <div class="provision-item">
                  <RadioGroup
                    label={dict.steps.provisions.alcoholLabel}
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
                      errorMessageFn={() => dict.errors.periods}
                      bind:values={formStore.data.guests[i].provisions.alcoholPeriods}
                      errorText={errors[`guests.${i}.provisions.alcoholPeriods`]}
                    />
                  </ExpandableSection>
                </div>

                <TextArea
                  label={dict.steps.provisions.commentLabel}
                  icon="edit_note"
                  placeholder={dict.steps.provisions.commentPlaceholder}
                  helperText={dict.steps.provisions.commentHint}
                  bind:value={formStore.data.guests[i].provisions.comment}
                  errorText={errors[`guests.${i}.provisions.comment`]}
                  onblur={() =>
                    formStore.markTouched(`guests.${i}.provisions.comment`)}
                />
              </SubBlock>
            </ExpandableSection>
          {/each}
        </Section>
      </ExpandableSection>
    {/if}
  {/if}
</Block>

<style>
  .provision-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
