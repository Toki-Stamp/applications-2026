<script>
  import { slide } from "svelte/transition";

  import { formStore } from "../store.js";
  import {
    APPLICATION_TYPE,
    GROUP_CONDITIONS,
    groupSizeOptions,
  } from "../constants.js";
  import RadioGroup from "../components/RadioGroup.svelte";
  import SelectInput from "../components/SelectInput.svelte";

  $: {
    if ($formStore.applicationType === APPLICATION_TYPE.GROUP) {
      const size = parseInt($formStore.totalGroupSize, 10);
      const targetGuests = isNaN(size) ? 1 : size - 1;
      if (targetGuests !== $formStore.guests.length) {
        formStore.updateGuestsCount(
          targetGuests,
          $formStore.applicant.nickname,
        );
      }
    }
  }
</script>

<div class="block-card">
  <h2 class="block-title">Формат участия</h2>
  <RadioGroup
    label="Тип заявки"
    required={true}
    bind:value={$formStore.applicationType}
    options={[
      {
        label: "Индивидуальная",
        helperText: "подаётся только за самого себя (на одного человека)",
        value: APPLICATION_TYPE.INDIVIDUAL,
      },
      {
        label: "Групповая",
        helperText:
          "подаётся в случае если Вы планируете посетить мероприятие группой (от двух до пяти человек)",
        value: APPLICATION_TYPE.GROUP,
      },
    ]}
  />

  {#if $formStore.applicationType === APPLICATION_TYPE.GROUP}
    <div transition:slide>
      <SelectInput
        label="Общее количество участников Вашей группы"
        helperText="указывается общее число людей, включая Вас как руководителя группы"
        icon="group_add"
        options={groupSizeOptions}
        bind:value={$formStore.totalGroupSize}
        required={true}
      />
      <RadioGroup
        label="Условия для участников Вашей группы"
        bind:value={$formStore.groupConditions}
        options={[
          {
            label: "Единые условия",
            helperText:
              "условия проживания и обеспечение полностью совпадают с Вашими",
            value: GROUP_CONDITIONS.UNIFIED,
          },
          {
            label: "Дифференцированные условия",
            helperText:
              "индивидуальные предпочтения для каждого из участников Вашей группы",
            value: GROUP_CONDITIONS.DIFFERENTIAL,
          },
        ]}
      />
    </div>
  {/if}
</div>

<style>
</style>
