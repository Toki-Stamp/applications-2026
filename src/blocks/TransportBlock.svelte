<script>
  import { formStore } from "../store.js";
  import { gridExpand } from "../utils.js";
  import {
    APPLICATION_TYPE,
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

  /** @type {any} */ let methodTo;
  /** @type {any} */ let freeSeatsTo;
  /** @type {any} */ let dayTo;
  /** @type {any} */ let timeTo;
  /** @type {any} */ let methodFrom;
  /** @type {any} */ let freeSeatsFrom;
  /** @type {any} */ let dayFrom;
  /** @type {any} */ let timeFrom;
  /** @type {any} */
  let comment;

  export function validate() {
    let errors = [];
    if (methodTo && !methodTo.validate())
      errors.push(methodTo.label + " (Туда)");
    if (freeSeatsTo && !freeSeatsTo.validate())
      errors.push(freeSeatsTo.label + " (Туда)");
    if (dayTo && !dayTo.validate()) errors.push(dayTo.label + " (Туда)");
    if (timeTo && !timeTo.validate()) errors.push(timeTo.label + " (Туда)");

    if (methodFrom && !methodFrom.validate())
      errors.push(methodFrom.label + " (Обратно)");
    if (dayFrom && !dayFrom.validate())
      errors.push(dayFrom.label + " (Обратно)");
    if (timeFrom && !timeFrom.validate())
      errors.push(timeFrom.label + " (Обратно)");

    if (
      comment &&
      typeof comment.validate === "function" &&
      !comment.validate()
    )
      errors.push(comment.label);

    return errors;
  }
</script>

<div class="block-card">
  <h2 class="block-title">Транспорт</h2>

  {#if $formStore.guests.length > 0}
    <div class="transport-hint">
      {#if $formStore.applicationType === APPLICATION_TYPE.GROUP}
        <HintBox>
          Для <strong class="text-primary">ГРУППОВЫХ ЗАЯВОК</strong> условия
          транспортировки распространяются на всех участников группы единым
          образом.<br /><br />
          Если кому-то из участников требуется другой вид транспорта или иное время
          выезда, пожалуйста, оформите на них отдельные индивидуальные заявки.
        </HintBox>
      {/if}
    </div>
  {/if}

  <div
    class="section-container {$formStore.guests.length === 0
      ? 'first-section'
      : ''}"
  >
    <h3 class="section-title">{stepNumber}.1. Дорога туда</h3>
    <SelectInput
      bind:this={methodTo}
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
            bind:this={freeSeatsTo}
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
      bind:this={dayTo}
      label="День отправления на базу"
      placeholder="Выберите день..."
      icon="calendar_month"
      required={true}
      bind:value={$formStore.transportTo.day}
      options={days}
    />
    <TextInput
      bind:this={timeTo}
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
      bind:this={methodFrom}
      label="Способ отъезда"
      placeholder="Выберите способ..."
      icon="directions_car"
      required={true}
      bind:value={$formStore.transportFrom.method}
      options={transportMethodsFrom}
    />

    <SelectInput
      bind:this={dayFrom}
      label="День отъезда с базы"
      placeholder="Выберите день..."
      icon="calendar_month"
      required={true}
      bind:value={$formStore.transportFrom.day}
      options={days}
    />
    <TextInput
      bind:this={timeFrom}
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
      bind:this={comment}
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
