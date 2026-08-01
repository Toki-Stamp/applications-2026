<script>
  import { slide } from "svelte/transition";
  import { formStore } from "../store.svelte.js";
  import {
    APPLICATION_TYPE,
    GROUP_CONDITIONS,
    accommodationOptions,
    ACCOMMODATION_TYPE,
    nightsList,
  } from "$shared/constants.js";
  import RadioGroup from "$shared/components/inputs/RadioGroup.svelte";
  import SelectionGrid from "$shared/components/inputs/SelectionGrid.svelte";
  import TextArea from "$shared/components/inputs/TextArea.svelte";
  import { getApplicantDisplayName, getGuestDisplayName } from "$shared/utils.js";
  import SubBlock from "$shared/components/layout/SubBlock.svelte";
  import HintBox from "$shared/components/ui/HintBox.svelte";
  import RichText from "$shared/components/ui/RichText.svelte";
  import Block from "$shared/components/layout/Block.svelte";
  import Section from "$shared/components/layout/Section.svelte";
  import ExpandableSection from "$shared/components/layout/ExpandableSection.svelte";
  import { dict } from "$shared/locales/ru.js";

  let { errors = {} } = $props();

  // Clear nights if booking is not required
  const accHint = dict.steps.accommodation.commentHint;

  $effect(() => {
    if (
      formStore.data.applicant.accommodation.type === ACCOMMODATION_TYPE.SELF
    ) {
      formStore.data.applicant.accommodation.nights = [];
    }
    for (let i = 0; i < formStore.data.guests.length; i++) {
      if (
        formStore.data.guests[i].accommodation.type === ACCOMMODATION_TYPE.SELF
      ) {
        formStore.data.guests[i].accommodation.nights = [];
      }
    }
  });
</script>

<Block title={dict.steps.accommodation.title} icon="hotel">
  {#if formStore.data.applicationType === APPLICATION_TYPE.INDIVIDUAL || formStore.data.groupConditions === GROUP_CONDITIONS.UNIFIED}
    {#if formStore.data.applicationType === APPLICATION_TYPE.GROUP}
      <div class="transport-hint">
        <HintBox>
          <RichText content={dict.steps.accommodation.unifiedHint1} />
        </HintBox>
        <HintBox>
          <RichText content={dict.steps.accommodation.unifiedHint2} />
        </HintBox>
      </div>
    {/if}

    <Section
      isFirst={formStore.data.applicationType !== APPLICATION_TYPE.GROUP}
    >
      <RadioGroup
        label={dict.steps.accommodation.typeLabel}
        required={true}
        bind:value={formStore.data.applicant.accommodation.type}
        errorText={errors["applicant.accommodation.type"]}
        onchange={() => formStore.markTouched("applicant.accommodation.type")}
        options={accommodationOptions}
      />

      <ExpandableSection
        show={formStore.data.applicant.accommodation.type ===
          ACCOMMODATION_TYPE.BOOKING}
      >
        <SelectionGrid
          groups={nightsList}
          label={dict.steps.accommodation.nightsLabel}
          errorMessageFn={dict.errors.nights}
          bind:values={formStore.data.applicant.accommodation.nights}
          errorText={errors["applicant.accommodation.nights"]}
        />
      </ExpandableSection>

      <TextArea
        label={dict.steps.accommodation.commentLabel}
        icon="edit_note"
        placeholder={dict.steps.accommodation.commentPlaceholder}
        helperText={accHint}
        bind:value={formStore.data.applicant.accommodation.comment}
        errorText={errors["applicant.accommodation.comment"]}
        onblur={() => formStore.markTouched("applicant.accommodation.comment")}
      />
    </Section>
  {:else}
    <HintBox>
      <RichText content={dict.steps.accommodation.diffHint} />
    </HintBox>

    <Section
      title={dict.steps.accommodation.forApplicant(
        getApplicantDisplayName(formStore.data.applicant),
      )}
    >
      <RadioGroup
        label={dict.steps.accommodation.typeLabel}
        required={true}
        bind:value={formStore.data.applicant.accommodation.type}
        errorText={errors["applicant.accommodation.type"]}
        onchange={() => formStore.markTouched("applicant.accommodation.type")}
        options={accommodationOptions}
      />

      <ExpandableSection
        show={formStore.data.applicant.accommodation.type ===
          ACCOMMODATION_TYPE.BOOKING}
      >
        <SelectionGrid
          groups={nightsList}
          required={true}
          label={dict.steps.accommodation.nightsLabel}
          errorMessageFn={dict.errors.nights}
          bind:values={formStore.data.applicant.accommodation.nights}
          errorText={errors["applicant.accommodation.nights"]}
        />
      </ExpandableSection>

      <TextArea
        label={dict.steps.accommodation.commentLabel}
        icon="edit_note"
        placeholder={dict.steps.accommodation.commentPlaceholder}
        helperText={accHint}
        bind:value={formStore.data.applicant.accommodation.comment}
        errorText={errors["applicant.accommodation.comment"]}
        onblur={() => formStore.markTouched("applicant.accommodation.comment")}
      />
    </Section>

    {#if formStore.data.guests.length > 0}
      <ExpandableSection show={true}>
        <Section title={dict.steps.personalData.groupTitle} gap="1.5rem">
          {#each formStore.data.guests as guest, index}
            <ExpandableSection show={true}>
              <SubBlock
                title={dict.steps.accommodation.forGuest(
                  getGuestDisplayName(guest, index),
                )}
              >
                <RadioGroup
                  label={dict.steps.accommodation.typeLabel}
                  required={true}
                  bind:value={guest.accommodation.type}
                  errorText={errors[`guests.${index}.accommodation.type`]}
                  onchange={() =>
                    formStore.markTouched(`guests.${index}.accommodation.type`)}
                  options={accommodationOptions}
                />

                <ExpandableSection
                  show={guest.accommodation.type === ACCOMMODATION_TYPE.BOOKING}
                >
                  <SelectionGrid
                    groups={nightsList}
                    required={true}
                    label={dict.steps.accommodation.nightsLabel}
                    errorMessageFn={dict.errors.nights}
                    bind:values={guest.accommodation.nights}
                    errorText={errors[`guests.${index}.accommodation.nights`]}
                  />
                </ExpandableSection>

                <TextArea
                  label={dict.steps.accommodation.commentLabel}
                  icon="edit_note"
                  placeholder={dict.steps.accommodation.commentPlaceholder}
                  helperText={accHint}
                  bind:value={guest.accommodation.comment}
                  errorText={errors[`guests.${index}.accommodation.comment`]}
                  onblur={() =>
                    formStore.markTouched(
                      `guests.${index}.accommodation.comment`,
                    )}
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
  .transport-hint {
    display: flex;
    flex-direction: column;
    gap: var(--gap-section);
  }
</style>
