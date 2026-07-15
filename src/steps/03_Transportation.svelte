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
  import HintBox from "../components/ui/HintBox.svelte";
  import Block from "../components/layout/Block.svelte";
  import Section from "../components/layout/Section.svelte";

  let { stepNumber, errors = {} } = $props();
  let detailsOverflowVisible = $state(formStore.data.transportTo.method === TRANSPORT_METHOD.DRIVER);

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
      return '"есть багажник для общих вещей", "готов забрать груз до 1 тонны" или "еду на мотоцикле без мест"';
    }
    return '"укачивает на заднем сиденье", "беру с собой большую гитару" или "готов помочь с погрузкой"';
  });
</script>

<Block title="Транспорт">
  {#if formStore.data.guests.length > 0}
    <div class="transport-hint">
      {#if formStore.data.applicationType === APPLICATION_TYPE.GROUP}
        <HintBox>
          Для <strong class="text-primary">ГРУППОВЫХ ЗАЯВОК</strong> условия транспортировки
          распространяются на всех участников группы единым образом
        </HintBox>
        <HintBox>
          Если кому-то из участников требуется другой вид транспорта или иное
          время выезда, пожалуйста, оформите на них отдельные <strong
            class="text-primary">ИНДИВИДУАЛЬНЫЕ ЗАЯВКИ</strong
          >
        </HintBox>
      {/if}
    </div>
  {/if}

  <Section title="{stepNumber}.1. Дорога туда" isFirst={formStore.data.guests.length === 0}>
      <SelectInput
        label="Способ прибытия"
        placeholder="Выберите способ..."
        icon="directions_car"
        required={true}
        bind:value={formStore.data.transportTo.method}
        errorText={errors["transportTo.method"]}
        onchange={() => formStore.markTouched("transportTo.method")}
        options={transportMethodsTo}
      />
      {#if formStore.data.transportTo.method === TRANSPORT_METHOD.DRIVER}
        <div transition:gridExpand onintroend={() => detailsOverflowVisible = true} onoutrostart={() => detailsOverflowVisible = false}>
          <div class="details-wrapper" style="overflow: {detailsOverflowVisible ? 'visible' : 'hidden'}">
            <SelectInput
              label="Свободных мест для попутчиков"
              placeholder="Укажите кол-во..."
              icon="airline_seat_recline_normal"
              required={true}
              bind:value={formStore.data.transportTo.freeSeats}
              errorText={errors["transportTo.freeSeats"]}
              onchange={() => formStore.markTouched("transportTo.freeSeats")}
              options={freeSeatsOptions}
            />
          </div>
        </div>
      {/if}
      <SelectInput
        label="День отправления на базу"
        placeholder="Выберите день..."
        icon="calendar_month"
        required={true}
        bind:value={formStore.data.transportTo.day}
        errorText={errors["transportTo.day"]}
        onchange={() => formStore.markTouched("transportTo.day")}
        options={days}
      />
      <TextInput
        label="Ориентировочное время отправления"
        icon="schedule"
        type="time"
        bind:value={formStore.data.transportTo.time}
        errorText={errors["transportTo.time"]}
        onblur={() => formStore.markTouched("transportTo.time")}
        required={true}
      />
      <TextInput
        label="Город отправления"
        icon="location_city"
        placeholder="Введите город..."
        bind:value={formStore.data.transportTo.departureCity}
        errorText={errors["transportTo.departureCity"]}
        onblur={() => formStore.markTouched("transportTo.departureCity")}
        required={true}
        capitalizeFirst={true}
      />
    </Section>

  <Section title="{stepNumber}.2. Дорога обратно">
      <SelectInput
        label="Способ отъезда"
        placeholder="Выберите способ..."
        icon="directions_car"
        required={true}
        bind:value={formStore.data.transportFrom.method}
        errorText={errors["transportFrom.method"]}
        onchange={() => formStore.markTouched("transportFrom.method")}
        options={availableTransportMethodsFrom}
      />

      <SelectInput
        label="День отъезда с базы"
        placeholder="Выберите день..."
        icon="calendar_month"
        required={true}
        bind:value={formStore.data.transportFrom.day}
        errorText={errors["transportFrom.day"]}
        onchange={() => formStore.markTouched("transportFrom.day")}
        options={days}
      />
      <TextInput
        label="Ориентировочное время отъезда"
        icon="schedule"
        type="time"
        bind:value={formStore.data.transportFrom.time}
        errorText={errors["transportFrom.time"]}
        onblur={() => formStore.markTouched("transportFrom.time")}
        required={true}
      />
    </Section>

  <Section title="{stepNumber}.3. Дополнительно по транспорту">
      <TextArea
        label="Комментарий к дороге"
        icon="edit_note"
        placeholder="Напишите здесь всё, что считаете важным..."
        helperText={transportHint}
        bind:value={formStore.data.transportComment}
        errorText={errors["transportComment"]}
        onblur={() => formStore.markTouched("transportComment")}
      />
    </Section>
</Block>

<style>
  .details-wrapper {
    min-height: 0;
    overflow: hidden;
  }

  .text-primary {
    color: var(--primary);
  }

  .transport-hint {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
