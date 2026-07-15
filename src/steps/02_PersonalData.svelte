<script>
  import { slide } from "svelte/transition";
  import { formStore } from "../store.svelte.js";
  import { APPLICATION_TYPE } from "../constants.js";
  import TextInput from "../components/fields/TextInput.svelte";
  import PhoneInput from "../components/fields/PhoneInput.svelte";
  import SubBlock from "../components/layout/SubBlock.svelte";
  import Block from "../components/layout/Block.svelte";
  import Section from "../components/layout/Section.svelte";
  import ExpandableSection from "../components/layout/ExpandableSection.svelte";

  let { errors = {} } = $props();
</script>

<Block title="Персональные данные">
  <Section title="2.1. Заявитель" isFirst={true}>
    <TextInput
      label="Никнейм"
      placeholder="cyber_ninja"
      icon="badge"
      bind:value={formStore.data.applicant.nickname}
      errorText={errors["applicant.nickname"]}
      onblur={() => formStore.markTouched("applicant.nickname")}
      required={true}
    />
    <TextInput
      label="Имя"
      placeholder="Иван"
      icon="person"
      bind:value={formStore.data.applicant.firstName}
      errorText={errors["applicant.firstName"]}
      onblur={() => formStore.markTouched("applicant.firstName")}
      capitalizeFirst={true}
    />
    <TextInput
      label="Фамилия"
      placeholder="Иванов"
      icon="person"
      bind:value={formStore.data.applicant.lastName}
      errorText={errors["applicant.lastName"]}
      onblur={() => formStore.markTouched("applicant.lastName")}
      capitalizeFirst={true}
    />
    <PhoneInput
      label="Номер телефона"
      bind:value={formStore.data.applicant.phone}
      errorText={errors["applicant.phone"]}
      onblur={() => formStore.markTouched("applicant.phone")}
      required={true}
    />
  </Section>

  <ExpandableSection
    show={formStore.data.applicationType === APPLICATION_TYPE.GROUP &&
      formStore.data.guests.length > 0}
  >
    <Section title="2.2. Состав группы">
      {#each formStore.data.guests as guest, i}
        <ExpandableSection show={true}>
          <SubBlock title={`Гость #${i + 1}`}>
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
          </SubBlock>
        </ExpandableSection>
      {/each}
    </Section>
  </ExpandableSection>
</Block>
