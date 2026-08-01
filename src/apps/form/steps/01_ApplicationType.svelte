<script>
  import { slide } from "svelte/transition";

  import { formStore } from "../store.svelte.js";
  import {
    APPLICATION_TYPE,
    GROUP_CONDITIONS,
    groupSizeOptions,
  } from "$shared/constants.js";
  import RadioGroup from "$shared/components/inputs/RadioGroup.svelte";
  import SelectInput from "$shared/components/inputs/SelectInput.svelte";
  import Block from "$shared/components/layout/Block.svelte";
  import Section from "$shared/components/layout/Section.svelte";
  import ExpandableSection from "$shared/components/layout/ExpandableSection.svelte";
  import { dict } from "$shared/locales/ru.js";

  let { errors = {} } = $props();

  $effect(() => {
    if (formStore.data.applicationType === APPLICATION_TYPE.GROUP) {
      const size = parseInt(formStore.data.totalGroupSize, 10);
      const targetGuests = isNaN(size) ? 0 : size - 1;
      if (targetGuests !== formStore.data.guests.length) {
        formStore.updateGuestsCount(targetGuests);
      }
    } else if (formStore.data.applicationType === APPLICATION_TYPE.INDIVIDUAL) {
      if (
        formStore.data.totalGroupSize !== null ||
        formStore.data.groupConditions !== null ||
        formStore.data.guests.length > 0
      ) {
        formStore.data.totalGroupSize = null;
        formStore.data.groupConditions = null;
        formStore.updateGuestsCount(0);
      }
    }
  });
</script>

<Block title={dict.steps.applicationType.title} icon="group">
  <Section isFirst={true}>
    <RadioGroup
      label={dict.steps.applicationType.typeLabel}
      required={true}
      bind:value={formStore.data.applicationType}
      errorText={errors["applicationType"]}
      onchange={() => formStore.markTouched("applicationType")}
      options={[
        {
          label: dict.steps.applicationType.individualLabel,
          helperText: dict.steps.applicationType.individualHelper,
          value: APPLICATION_TYPE.INDIVIDUAL,
        },
        {
          label: dict.steps.applicationType.groupLabel,
          helperText: dict.steps.applicationType.groupHelper,
          value: APPLICATION_TYPE.GROUP,
        },
      ]}
    />

    <ExpandableSection
      show={formStore.data.applicationType === APPLICATION_TYPE.GROUP}
    >
      <SelectInput
        label={dict.steps.applicationType.totalSizeLabel}
        helperText={dict.steps.applicationType.totalSizeHelper}
        placeholder={dict.steps.applicationType.totalSizePlaceholder}
        icon="group_add"
        options={groupSizeOptions}
        bind:value={formStore.data.totalGroupSize}
        errorText={errors["totalGroupSize"]}
        onchange={() => formStore.markTouched("totalGroupSize")}
        required={true}
      />
      <RadioGroup
        label={dict.steps.applicationType.conditionsLabel}
        bind:value={formStore.data.groupConditions}
        errorText={errors["groupConditions"]}
        onchange={() => formStore.markTouched("groupConditions")}
        required={true}
        options={[
          {
            label: dict.steps.applicationType.unifiedLabel,
            helperText: dict.steps.applicationType.unifiedHelper,
            value: GROUP_CONDITIONS.UNIFIED,
          },
          {
            label: dict.steps.applicationType.differentialLabel,
            helperText: dict.steps.applicationType.differentialHelper,
            value: GROUP_CONDITIONS.DIFFERENTIAL,
          },
        ]}
      />
    </ExpandableSection>
  </Section>
</Block>
