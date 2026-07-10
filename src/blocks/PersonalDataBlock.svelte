<script>
  import { slide } from 'svelte/transition';
  import { formStore } from '../store.js';
  import { APPLICATION_TYPE } from '../constants.js';
  import TextInput from '../components/TextInput.svelte';
  import PhoneInput from '../components/PhoneInput.svelte';
  import SubBlockCard from '../components/SubBlockCard.svelte';

  export let stepNumber;
</script>

<div class="block-card">
  <h2 class="block-title">Персональные данные</h2>
  <div class="section-container first-section">
    <h3 class="section-title">2.1. Заявитель</h3>
    <TextInput label="Никнейм" placeholder="Например: cyber_ninja" icon="badge" bind:value={$formStore.applicant.nickname} required={true} />
    <TextInput label="Имя" placeholder="Например: Иван" icon="person" bind:value={$formStore.applicant.firstName} />
    <TextInput label="Фамилия" placeholder="Например: Иванов" icon="person" bind:value={$formStore.applicant.lastName} />
    <PhoneInput label="Номер телефона" bind:value={$formStore.applicant.phone} required={true} />
  </div>

  {#if $formStore.applicationType === APPLICATION_TYPE.GROUP && $formStore.guests.length > 0}
    <div class="section-container" transition:slide>
      <h3 class="section-title">
        2.2. Гости
      </h3>
      {#each $formStore.guests as guest, i}
        <div transition:slide>
          <SubBlockCard title={`Гость #${i + 1}`}>
            <TextInput label="Имя" placeholder="Например: Иван" icon="person" bind:value={$formStore.guests[i].firstName} required={true} />
            <TextInput label="Фамилия" placeholder="Например: Иванов" icon="person" bind:value={$formStore.guests[i].lastName} />
            <TextInput label="Никнейм" placeholder="Например: cyber_ninja" icon="badge" bind:value={$formStore.guests[i].nickname} />
            <PhoneInput label="Номер телефона" bind:value={$formStore.guests[i].phone} />
          </SubBlockCard>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
</style>
