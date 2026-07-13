<script>
  import { slide } from "svelte/transition";
  import { formStore } from "../store.js";
  import { APPLICATION_TYPE } from "../constants.js";
  import TextInput from "../components/TextInput.svelte";
  import PhoneInput from "../components/PhoneInput.svelte";
  import SubBlockCard from "../components/SubBlockCard.svelte";

  /** @type {any} */ let applicantNickname;
  /** @type {any} */ let applicantFirstName;
  /** @type {any} */ let applicantLastName;
  /** @type {any} */ let applicantPhone;
  /** @type {any[]} */ let guestFirstNames = [];
  /** @type {any[]} */ let guestLastNames = [];
  /** @type {any[]} */ let guestNicknames = [];
  /** @type {any[]} */ let guestPhones = [];

  $: {
    const len = $formStore.guests.length;
    guestFirstNames = guestFirstNames.slice(0, len);
    guestLastNames = guestLastNames.slice(0, len);
    guestNicknames = guestNicknames.slice(0, len);
    guestPhones = guestPhones.slice(0, len);
  }

  export function validate(forceTouch = false) {
    let errors = [];
    if (applicantNickname && !applicantNickname.validate(forceTouch)) errors.push(applicantNickname.label + " (Заявитель)");
    if (applicantFirstName && !applicantFirstName.validate(forceTouch)) errors.push(applicantFirstName.label + " (Заявитель)");
    if (applicantLastName && !applicantLastName.validate(forceTouch)) errors.push(applicantLastName.label + " (Заявитель)");
    if (applicantPhone && !applicantPhone.validate(forceTouch)) errors.push(applicantPhone.label + " (Заявитель)");

    if ($formStore.applicationType === APPLICATION_TYPE.GROUP) {
      for (let i = 0; i < $formStore.guests.length; i++) {
        if (guestFirstNames[i] && !guestFirstNames[i].validate(forceTouch)) errors.push(`${guestFirstNames[i].label} (Гость ${i + 1})`);
        if (guestLastNames[i] && !guestLastNames[i].validate(forceTouch)) errors.push(`${guestLastNames[i].label} (Гость ${i + 1})`);
        if (guestNicknames[i] && !guestNicknames[i].validate(forceTouch)) errors.push(`${guestNicknames[i].label} (Гость ${i + 1})`);
        if (guestPhones[i] && !guestPhones[i].validate(forceTouch)) errors.push(`${guestPhones[i].label} (Гость ${i + 1})`);
      }
    }
    return errors;
  }
</script>

<div class="block-card">
  <h2 class="block-title">Персональные данные</h2>
  <div class="section-container first-section">
    <h3 class="section-title">2.1. Заявитель</h3>
    <div class="section-content">
      <TextInput
        bind:this={applicantNickname}
        label="Никнейм"
        placeholder="cyber_ninja"
        icon="badge"
        bind:value={$formStore.applicant.nickname}
        required={true}
      />
      <TextInput
        bind:this={applicantFirstName}
        label="Имя"
        placeholder="Иван"
        icon="person"
        bind:value={$formStore.applicant.firstName}
      />
      <TextInput
        bind:this={applicantLastName}
        label="Фамилия"
        placeholder="Иванов"
        icon="person"
        bind:value={$formStore.applicant.lastName}
      />
      <PhoneInput
        bind:this={applicantPhone}
        label="Номер телефона"
        bind:value={$formStore.applicant.phone}
        required={true}
      />
    </div>
  </div>

  {#if $formStore.applicationType === APPLICATION_TYPE.GROUP && $formStore.guests.length > 0}
    <div class="section-container" transition:slide>
      <h3 class="section-title">2.2. Гости</h3>
      <div class="section-content">
        {#each $formStore.guests as guest, i}
          <div transition:slide>
            <SubBlockCard title={`Гость #${i + 1}`}>
              <TextInput
                bind:this={guestFirstNames[i]}
                label="Имя"
                placeholder="Иван"
                icon="person"
                bind:value={$formStore.guests[i].firstName}
                required={true}
              />
              <TextInput
                bind:this={guestLastNames[i]}
                label="Фамилия"
                placeholder="Иванов"
                icon="person"
                bind:value={$formStore.guests[i].lastName}
              />
              <TextInput
                bind:this={guestNicknames[i]}
                label="Никнейм"
                placeholder="cyber_ninja"
                icon="badge"
                bind:value={$formStore.guests[i].nickname}
              />
              <PhoneInput
                bind:this={guestPhones[i]}
                label="Номер телефона"
                bind:value={$formStore.guests[i].phone}
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
