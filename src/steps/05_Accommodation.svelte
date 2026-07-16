<script>
  import { slide } from "svelte/transition";
  import { formStore } from "../store.svelte.js";
  import {
    APPLICATION_TYPE,
    GROUP_CONDITIONS,
    accommodationOptions,
    ACCOMMODATION_TYPE,
    nightsList,
    ERROR_MESSAGES,
  } from "../constants.js";
  import RadioGroup from "../components/fields/RadioGroup.svelte";
  import SelectionGrid from "../components/fields/SelectionGrid.svelte";
  import TextArea from "../components/fields/TextArea.svelte";
  import SubBlock from "../components/layout/SubBlock.svelte";
  import HintBox from "../components/ui/HintBox.svelte";
  import Block from "../components/layout/Block.svelte";
  import Section from "../components/layout/Section.svelte";
  import ExpandableSection from "../components/layout/ExpandableSection.svelte";

  let { errors = {} } = $props();

  // Clear nights if booking is not required
  const accHint =
    '"нужен 2-местный номер с тихой кроватью", "не пью из-за язвы" или "проживание не нужно, беру палатку и надувную лодку".';

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

<Block title="Проживание">
  {#if formStore.data.applicationType === APPLICATION_TYPE.INDIVIDUAL || formStore.data.groupConditions === GROUP_CONDITIONS.UNIFIED}
    <Section isFirst={true}>
      <RadioGroup
        label="Потребность в проживании"
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
          label="Укажите ночевки"
          errorMessageFn={ERROR_MESSAGES.NIGHTS}
          bind:values={formStore.data.applicant.accommodation.nights}
          errorText={errors["applicant.accommodation.nights"]}
        />
      </ExpandableSection>

      <TextArea
        label="Дополнительные комментарии к проживанию и обеспечению"
        icon="edit_note"
        placeholder="Напишите здесь всё, что считаете важным..."
        helperText={accHint}
        bind:value={formStore.data.applicant.accommodation.comment}
        errorText={errors["applicant.accommodation.comment"]}
        onblur={() => formStore.markTouched("applicant.accommodation.comment")}
      />
    </Section>
  {:else}
    <HintBox>Укажите потребности для каждого участника группы отдельно</HintBox>

    <SubBlock
      title={`Для ${formStore.data.applicant.nickname || "Заявителя"}`}
      stickyLevel={2}
    >
      <div class="section-content">
        <RadioGroup
          label="Потребность в проживании"
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
            label="Укажите ночевки"
            errorMessageFn={ERROR_MESSAGES.NIGHTS}
            bind:values={formStore.data.applicant.accommodation.nights}
            errorText={errors["applicant.accommodation.nights"]}
          />
        </ExpandableSection>

        <TextArea
          label="Дополнительные комментарии к проживанию и обеспечению"
          icon="edit_note"
          placeholder="Напишите здесь всё, что считаете важным..."
          helperText={accHint}
          bind:value={formStore.data.applicant.accommodation.comment}
          errorText={errors["applicant.accommodation.comment"]}
          onblur={() =>
            formStore.markTouched("applicant.accommodation.comment")}
        />
      </div>
    </SubBlock>

    {#each formStore.data.guests as guest, index}
      <SubBlock
        title={`Для ${guest.firstName || `Гостя #${index + 1}`}`}
        stickyLevel={2}
      >
        <div class="section-content">
          <RadioGroup
            label="Потребность в проживании"
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
              label="Укажите ночевки"
              errorMessageFn={ERROR_MESSAGES.NIGHTS}
              bind:values={guest.accommodation.nights}
              errorText={errors[`guests.${index}.accommodation.nights`]}
            />
          </ExpandableSection>

          <TextArea
            label="Дополнительные комментарии к проживанию и обеспечению"
            icon="edit_note"
            placeholder="Напишите здесь всё, что считаете важным..."
            helperText={accHint}
            bind:value={guest.accommodation.comment}
            errorText={errors[`guests.${index}.accommodation.comment`]}
            onblur={() =>
              formStore.markTouched(`guests.${index}.accommodation.comment`)}
          />
        </div>
      </SubBlock>
    {/each}
  {/if}
</Block>
