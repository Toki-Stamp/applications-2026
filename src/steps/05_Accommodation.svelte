<script>
  import { slide } from "svelte/transition";
  import { formStore } from "../store.svelte.js";
  import {
    APPLICATION_TYPE,
    GROUP_CONDITIONS,
    accommodationOptions,
    ACCOMMODATION_TYPE,
    nightsList,
  } from "../constants.js";
  import RadioGroup from "../components/fields/RadioGroup.svelte";
  import SelectionGrid from "../components/fields/SelectionGrid.svelte";
  import TextArea from "../components/fields/TextArea.svelte";
  import SubBlock from "../components/layout/SubBlock.svelte";
  import HintBox from "../components/ui/HintBox.svelte";
  import Block from "../components/layout/Block.svelte";
  import Section from "../components/layout/Section.svelte";
  import ExpandableSection from "../components/layout/ExpandableSection.svelte";
  import { dict } from "../locales/ru.js";

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
    <Section isFirst={true}>
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
    <HintBox>{dict.steps.accommodation.diffHint}</HintBox>

    <SubBlock
      title={dict.steps.accommodation.forApplicant(
        formStore.data.applicant.nickname || "Заявителя",
      )}
      stickyLevel={2}
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
    </SubBlock>

    {#each formStore.data.guests as guest, index}
      <SubBlock
        title={dict.steps.accommodation.forGuest(
          guest.firstName || `Гостя #${index + 1}`,
        )}
        stickyLevel={2}
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
            formStore.markTouched(`guests.${index}.accommodation.comment`)}
        />
      </SubBlock>
    {/each}
  {/if}
</Block>
