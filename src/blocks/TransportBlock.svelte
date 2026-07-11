<script>
  import { formStore } from "../store.js";
  import { gridExpand } from "../utils.js";
  import {
    TRANSPORT_METHOD,
    days,
    transportMethods,
    transportMethodsFrom,
    freeSeatsOptions,
  } from "../constants.js";
  import SelectInput from "../components/SelectInput.svelte";
  import TextInput from "../components/TextInput.svelte";
  import TextArea from "../components/TextArea.svelte";
  import HintBox from "../components/HintBox.svelte";

  export let stepNumber;
</script>

<div class="block-card">
  <h2 class="block-title">Транспорт</h2>

  {#if $formStore.guests.length > 0}
    <div class="transport-hint">
      <HintBox>
        Для <strong class="text-primary">ГРУППОВЫХ ЗАЯВОК</strong> условия транспортировки
        распространяются на всех участников группы единым образом
      </HintBox>
    </div>
  {/if}

  <div
    class="section-container {$formStore.guests.length === 0
      ? 'first-section'
      : ''}"
  >
    <h3 class="section-title">{stepNumber}.1. Дорога туда</h3>
    <SelectInput
      label="Способ прибытия"
      placeholder="Выберите способ..."
      icon="directions_car"
      required={true}
      bind:value={$formStore.transportTo.method}
      options={transportMethods}
    />
    {#if $formStore.transportTo.method === TRANSPORT_METHOD.DRIVER}
      <div transition:gridExpand>
        <div class="details-wrapper">
          <SelectInput
            label="Свободных мест для попутчиков"
            placeholder="Укажите кол-во..."
            icon="airline_seat_recline_normal"
            bind:value={$formStore.transportTo.freeSeats}
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
      bind:value={$formStore.transportTo.day}
      options={days}
    />
    <TextInput
      label="Ориентировочное время отправления"
      icon="schedule"
      type="time"
      bind:value={$formStore.transportTo.time}
      required={true}
    />
  </div>

  <div class="section-container">
    <h3 class="section-title">{stepNumber}.2. Дорога обратно</h3>
    <SelectInput
      label="Способ отъезда"
      placeholder="Выберите способ..."
      icon="directions_car"
      required={true}
      bind:value={$formStore.transportFrom.method}
      options={transportMethodsFrom}
    />
    {#if $formStore.transportFrom.method === TRANSPORT_METHOD.DRIVER}
      <div transition:gridExpand>
        <div class="details-wrapper">
          <SelectInput
            label="Свободных мест для попутчиков"
            placeholder="Укажите кол-во..."
            icon="airline_seat_recline_normal"
            bind:value={$formStore.transportFrom.freeSeats}
            options={freeSeatsOptions}
          />
        </div>
      </div>
    {/if}
    <SelectInput
      label="День отъезда с базы"
      placeholder="Выберите день..."
      icon="calendar_month"
      required={true}
      bind:value={$formStore.transportFrom.day}
      options={days}
    />
    <TextInput
      label="Ориентировочное время отъезда"
      icon="schedule"
      type="time"
      bind:value={$formStore.transportFrom.time}
      required={true}
    />
  </div>

  <div class="section-container">
    <h3 class="section-title">{stepNumber}.3. Дополнительно по транспорту</h3>
    <TextArea
      label="Комментарий к дороге"
      icon="edit_note"
      placeholder="Напишите здесь всё, что считаете важным..."
      bind:value={$formStore.transportComment}
    />
  </div>
</div>

<style>
  .details-wrapper {
    min-height: 0;
    overflow: hidden;
  }

  .text-primary {
    color: var(--primary);
  }
</style>
