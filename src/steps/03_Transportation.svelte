<script>
  import { formStore } from "../store.svelte.js";
  import { gridExpand } from "../utils.js";
  import {
    APPLICATION_TYPE,
    TRANSPORT_METHOD,
    days,
    transportMethodsTo,
    freeSeatsOptions,
  } from "../constants.js";
  import SelectInput from "../components/fields/SelectInput.svelte";
  import TextInput from "../components/fields/TextInput.svelte";
  import TextArea from "../components/fields/TextArea.svelte";
  import RichText from "../components/ui/RichText.svelte";
  import HintBox from "../components/ui/HintBox.svelte";
  import Block from "../components/layout/Block.svelte";
  import Section from "../components/layout/Section.svelte";
  import ExpandableSection from "../components/layout/ExpandableSection.svelte";
  import { dict } from "../locales/ru.js";

  let { stepNumber, errors = {} } = $props();

  const availableTransportMethodsFrom = $derived(
    formStore.data.transportTo.method === TRANSPORT_METHOD.DRIVER
      ? transportMethodsTo
      : transportMethodsTo.filter((m) => m.value !== TRANSPORT_METHOD.DRIVER),
  );

  $effect(() => {
    const fromMethod = formStore.data.transportFrom.method;
    const toMethod = formStore.data.transportTo.method;
    // Clear return methods that require going as driver when not going as driver
    if (
      fromMethod === TRANSPORT_METHOD.DRIVER &&
      toMethod !== TRANSPORT_METHOD.DRIVER
    ) {
      formStore.data.transportFrom.method = null;
    }
  });

  let transportHint = $derived.by(() => {
    const isDriver =
      formStore.data.transportTo.method === TRANSPORT_METHOD.DRIVER ||
      formStore.data.transportFrom.method === TRANSPORT_METHOD.DRIVER;
    if (isDriver) {
      return dict.steps.transportation.driverHint;
    }
    return dict.steps.transportation.passengerHint;
  });
</script>

<Block title={dict.steps.transportation.title}>
  {#if formStore.data.guests.length > 0}
    <div class="transport-hint">
      {#if formStore.isGroup}
        <HintBox type="info" class="mb-1">
          <RichText content={dict.steps.transportation.groupHint1} />
        </HintBox>
        <HintBox type="info" class="mb-1">
          <RichText content={dict.steps.transportation.groupHint2} />
        </HintBox>
      {/if}
    </div>
  {/if}

  <Section
    title={dict.steps.transportation.toTitle(stepNumber)}
    isFirst={formStore.data.guests.length === 0}
  >
    <SelectInput
      label={dict.steps.transportation.toMethodLabel}
      placeholder={dict.steps.transportation.toMethodPlaceholder}
      icon="directions_car"
      required={true}
      bind:value={formStore.data.transportTo.method}
      errorText={errors["transportTo.method"]}
      onchange={() => formStore.markTouched("transportTo.method")}
      options={transportMethodsTo}
    />
    <ExpandableSection
      show={formStore.data.transportTo.method === TRANSPORT_METHOD.DRIVER}
    >
      <SelectInput
        label={dict.steps.transportation.freeSeatsLabel}
        placeholder={dict.steps.transportation.freeSeatsPlaceholder}
        icon="airline_seat_recline_normal"
        required={true}
        bind:value={formStore.data.transportTo.freeSeats}
        errorText={errors["transportTo.freeSeats"]}
        onchange={() => formStore.markTouched("transportTo.freeSeats")}
        options={freeSeatsOptions}
      />
    </ExpandableSection>
    <SelectInput
      label={dict.steps.transportation.toDayLabel}
      placeholder={dict.steps.transportation.toDayPlaceholder}
      icon="calendar_month"
      required={true}
      bind:value={formStore.data.transportTo.day}
      errorText={errors["transportTo.day"]}
      onchange={() => formStore.markTouched("transportTo.day")}
      options={days}
    />
    <TextInput
      label={dict.steps.transportation.toTimeLabel}
      icon="schedule"
      type="time"
      bind:value={formStore.data.transportTo.time}
      errorText={errors["transportTo.time"]}
      onblur={() => formStore.markTouched("transportTo.time")}
      required={true}
    />
    <TextInput
      label={dict.steps.transportation.toCityLabel}
      icon="location_city"
      placeholder={dict.steps.transportation.toCityPlaceholder}
      bind:value={formStore.data.transportTo.departureCity}
      errorText={errors["transportTo.departureCity"]}
      onblur={() => formStore.markTouched("transportTo.departureCity")}
      required={true}
      capitalizeFirst={true}
    />
  </Section>

  <Section title={dict.steps.transportation.fromTitle(stepNumber)}>
    <SelectInput
      label={dict.steps.transportation.fromMethodLabel}
      placeholder={dict.steps.transportation.fromMethodPlaceholder}
      icon="directions_car"
      required={true}
      bind:value={formStore.data.transportFrom.method}
      errorText={errors["transportFrom.method"]}
      onchange={() => formStore.markTouched("transportFrom.method")}
      options={availableTransportMethodsFrom}
    />

    <SelectInput
      label={dict.steps.transportation.fromDayLabel}
      placeholder={dict.steps.transportation.fromDayPlaceholder}
      icon="calendar_month"
      required={true}
      bind:value={formStore.data.transportFrom.day}
      errorText={errors["transportFrom.day"]}
      onchange={() => formStore.markTouched("transportFrom.day")}
      options={days}
    />
    <TextInput
      label={dict.steps.transportation.fromTimeLabel}
      icon="schedule"
      type="time"
      bind:value={formStore.data.transportFrom.time}
      errorText={errors["transportFrom.time"]}
      onblur={() => formStore.markTouched("transportFrom.time")}
      required={true}
    />
  </Section>

  <Section title={dict.steps.transportation.commentTitle(stepNumber)}>
    <TextArea
      label={dict.steps.transportation.commentLabel}
      icon="edit_note"
      placeholder={dict.steps.transportation.commentPlaceholder}
      helperText={transportHint}
      bind:value={formStore.data.transportComment}
      errorText={errors["transportComment"]}
      onblur={() => formStore.markTouched("transportComment")}
    />
  </Section>
</Block>

<style>
  .text-primary {
    color: var(--primary);
  }

  .transport-hint {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
