<script>
  import { slide } from 'svelte/transition';
  import { formStore } from '../store.svelte.js';
  import {
    APPLICATION_TYPE,
    GROUP_CONDITIONS,
    accommodationOptions,
    ACCOMMODATION_TYPE
  } from '../constants.js';
  import RadioGroup from '../components/RadioGroup.svelte';
  import NightsGrid from '../components/NightsGrid.svelte';
  import TextArea from '../components/TextArea.svelte';
  import SubBlockCard from '../components/SubBlockCard.svelte';
  import HintBox from '../components/HintBox.svelte';

  let { errors = {} } = $props();

  // Clear nights if booking is not required
  const accHint = '"нужен 2-местный номер с тихой кроватью", "не пью из-за язвы" или "проживание не нужно, беру палатку и надувную лодку".';

  $effect(() => {
    if (formStore.data.applicant.accommodation.type === ACCOMMODATION_TYPE.SELF) {
      formStore.data.applicant.accommodation.nights = [];
    }
    for (let i = 0; i < formStore.data.guests.length; i++) {
      if (formStore.data.guests[i].accommodation.type === ACCOMMODATION_TYPE.SELF) {
        formStore.data.guests[i].accommodation.nights = [];
      }
    }
  });
</script>

<div class="block-card">
  <h2 class="block-title">Проживание</h2>

  {#if formStore.data.applicationType === APPLICATION_TYPE.INDIVIDUAL || formStore.data.groupConditions === GROUP_CONDITIONS.UNIFIED}
    <div class="section-container first-section">
      <div class="section-content">
        <RadioGroup
          label="Потребность в проживании"
          required={true}
          bind:value={formStore.data.applicant.accommodation.type}
          errorText={errors['applicant.accommodation.type']}
          onchange={() => formStore.markTouched('applicant.accommodation.type')}
          options={accommodationOptions}
        />

        {#if formStore.data.applicant.accommodation.type === ACCOMMODATION_TYPE.BOOKING}
          <div transition:slide class="slide-container">
            <NightsGrid
              required={true}
              label="Укажите ночевки"
              bind:values={formStore.data.applicant.accommodation.nights}
              errorText={errors['applicant.accommodation.nights']}
            />
          </div>
        {/if}

        <TextArea
          label="Дополнительные комментарии к проживанию и обеспечению"
          icon="edit_note"
          placeholder="Напишите здесь всё, что считаете важным..."
          helperText={accHint}
          bind:value={formStore.data.applicant.accommodation.comment}
          errorText={errors['applicant.accommodation.comment']}
          onblur={() => formStore.markTouched('applicant.accommodation.comment')}
        />
      </div>
    </div>
  {:else}
    <HintBox>Укажите потребности для каждого участника группы отдельно</HintBox>

    <SubBlockCard
      title={`Для ${formStore.data.applicant.nickname || "Заявителя"}`}
      stickyLevel={2}
    >
      <div class="section-content">
        <RadioGroup
          label="Потребность в проживании"
          required={true}
          bind:value={formStore.data.applicant.accommodation.type}
          errorText={errors['applicant.accommodation.type']}
          onchange={() => formStore.markTouched('applicant.accommodation.type')}
          options={accommodationOptions}
        />

        {#if formStore.data.applicant.accommodation.type === ACCOMMODATION_TYPE.BOOKING}
          <div transition:slide class="slide-container">
            <NightsGrid
              required={true}
              label="Укажите ночевки"
              bind:values={formStore.data.applicant.accommodation.nights}
              errorText={errors['applicant.accommodation.nights']}
            />
          </div>
        {/if}

        <TextArea
          label="Дополнительные комментарии к проживанию и обеспечению"
          icon="edit_note"
          placeholder="Напишите здесь всё, что считаете важным..."
          helperText={accHint}
          bind:value={formStore.data.applicant.accommodation.comment}
          errorText={errors['applicant.accommodation.comment']}
          onblur={() => formStore.markTouched('applicant.accommodation.comment')}
        />
      </div>
    </SubBlockCard>

    {#each formStore.data.guests as guest, index}
      <SubBlockCard
        title={`Для ${guest.firstName || `Гостя #${index + 1}`}`}
        stickyLevel={2}
      >
        <div class="section-content">
          <RadioGroup
            label="Потребность в проживании"
            required={true}
            bind:value={guest.accommodation.type}
            errorText={errors[`guests.${index}.accommodation.type`]}
            onchange={() => formStore.markTouched(`guests.${index}.accommodation.type`)}
            options={accommodationOptions}
          />

          {#if guest.accommodation.type === ACCOMMODATION_TYPE.BOOKING}
            <div transition:slide class="slide-container">
              <NightsGrid
                required={true}
                label="Укажите ночевки"
                bind:values={guest.accommodation.nights}
                errorText={errors[`guests.${index}.accommodation.nights`]}
              />
            </div>
          {/if}

          <TextArea
            label="Дополнительные комментарии к проживанию и обеспечению"
            icon="edit_note"
            placeholder="Напишите здесь всё, что считаете важным..."
            helperText={accHint}
            bind:value={guest.accommodation.comment}
            errorText={errors[`guests.${index}.accommodation.comment`]}
            onblur={() => formStore.markTouched(`guests.${index}.accommodation.comment`)}
          />
        </div>
      </SubBlockCard>
    {/each}
  {/if}
</div>

<style>
  .slide-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
