<script>
  import { slide } from 'svelte/transition';
  import { formStore } from '../store.js';
  import {
    TRANSPORT_METHOD,
    days,
    transportMethods,
    transportMethodsFrom,
    freeSeatsOptions
  } from "../constants.js";
  import SelectInput from '../components/SelectInput.svelte';
  import TextInput from '../components/TextInput.svelte';
  import TextArea from '../components/TextArea.svelte';

  export let stepNumber;
</script>

<div class="block-card">
  <h2 class="block-title">Транспорт</h2>
  
  <div class="section-container first-section">
    <h3 class="section-title">3.1. Дорога туда</h3>
    <SelectInput label="Способ прибытия" icon="directions_car" required={true} bind:value={$formStore.transportTo.method} options={transportMethods} />
    {#if $formStore.transportTo.method === TRANSPORT_METHOD.DRIVER}
      <div transition:slide>
        <SelectInput label="Свободных мест для попутчиков" icon="airline_seat_recline_normal" bind:value={$formStore.transportTo.freeSeats} options={freeSeatsOptions} />
      </div>
    {/if}
    <SelectInput label="День отправления на базу" icon="calendar_month" required={true} bind:value={$formStore.transportTo.day} options={days} />
    <TextInput label="Ориентировочное время отправления" icon="schedule" type="time" bind:value={$formStore.transportTo.time} required={true} />
  </div>

  <div class="section-container">
    <h3 class="section-title">3.2. Дорога обратно</h3>
    <SelectInput label="Способ отъезда" icon="directions_car" required={true} bind:value={$formStore.transportFrom.method} options={transportMethodsFrom} />
    {#if $formStore.transportFrom.method === TRANSPORT_METHOD.DRIVER}
      <div transition:slide>
        <SelectInput label="Свободных мест для попутчиков" icon="airline_seat_recline_normal" bind:value={$formStore.transportFrom.freeSeats} options={freeSeatsOptions} />
      </div>
    {/if}
    <SelectInput label="День отъезда с базы" icon="calendar_month" required={true} bind:value={$formStore.transportFrom.day} options={days} />
    <TextInput label="Ориентировочное время отъезда" icon="schedule" type="time" bind:value={$formStore.transportFrom.time} required={true} />
  </div>

  <div class="section-container">
    <h3 class="section-title">{stepNumber}.3. Дополнительно по транспорту</h3>
    <TextArea label="Комментарий к дороге" bind:value={$formStore.transportComment} />
  </div>
</div>

<style>


</style>
