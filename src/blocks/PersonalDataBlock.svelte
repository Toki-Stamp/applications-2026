<script>
  import { slide } from "svelte/transition";
  import { formStore } from "../store.svelte.js";
  import { APPLICATION_TYPE } from "../constants.js";
  import TextInput from "../components/TextInput.svelte";
  import PhoneInput from "../components/PhoneInput.svelte";
  import SubBlockCard from "../components/SubBlockCard.svelte";

  let { errors = {} } = $props();
</script>

<div class="block-card">
  <h2 class="block-title">Персональные данные</h2>
  <div class="section-container first-section">
    <h3 class="section-title">2.1. Заявитель</h3>
    <div class="section-content">
      <TextInput
        label="Никнейм"
        placeholder="cyber_ninja"
        icon="badge"
        bind:value={formStore.data.applicant.nickname}
        errorText={errors['applicant.nickname']}
        onblur={() => formStore.markTouched('applicant.nickname')}
        required={true}
      />
      <TextInput
        label="Имя"
        placeholder="Иван"
        icon="person"
        bind:value={formStore.data.applicant.firstName}
        errorText={errors['applicant.firstName']}
        onblur={() => formStore.markTouched('applicant.firstName')}
        capitalizeFirst={true}
      />
      <TextInput
        label="Фамилия"
        placeholder="Иванов"
        icon="person"
        bind:value={formStore.data.applicant.lastName}
        errorText={errors['applicant.lastName']}
        onblur={() => formStore.markTouched('applicant.lastName')}
        capitalizeFirst={true}
      />
      <PhoneInput
        label="Номер телефона"
        bind:value={formStore.data.applicant.phone}
        errorText={errors['applicant.phone']}
        onblur={() => formStore.markTouched('applicant.phone')}
        required={true}
      />
    </div>
  </div>

  {#if formStore.data.applicationType === APPLICATION_TYPE.GROUP && formStore.data.guests.length > 0}
    <div class="section-container" transition:slide>
      <h3 class="section-title">2.2. Гости</h3>
      <div class="section-content">
        {#each formStore.data.guests as guest, i}
          <div transition:slide>
            <SubBlockCard title={`Гость #${i + 1}`}>
              <TextInput
                label="Имя"
                placeholder="Иван"
                icon="person"
                bind:value={formStore.data.guests[i].firstName}
                errorText={errors[`guests.${i}.firstName`]}
                onblur={() => formStore.markTouched(`guests.${i}.firstName`)}
                required={true}
                capitalizeFirst={true}
              />
              <TextInput
                label="Фамилия"
                placeholder="Иванов"
                icon="person"
                bind:value={formStore.data.guests[i].lastName}
                errorText={errors[`guests.${i}.lastName`]}
                onblur={() => formStore.markTouched(`guests.${i}.lastName`)}
                capitalizeFirst={true}
              />
              <TextInput
                label="Никнейм"
                placeholder="cyber_ninja"
                icon="badge"
                bind:value={formStore.data.guests[i].nickname}
                errorText={errors[`guests.${i}.nickname`]}
                onblur={() => formStore.markTouched(`guests.${i}.nickname`)}
              />
              <PhoneInput
                label="Номер телефона"
                bind:value={formStore.data.guests[i].phone}
                errorText={errors[`guests.${i}.phone`]}
                onblur={() => formStore.markTouched(`guests.${i}.phone`)}
              />
            </SubBlockCard>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
</style>
