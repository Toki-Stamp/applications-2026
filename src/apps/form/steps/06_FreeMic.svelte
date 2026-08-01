<script>
  import { formStore } from "../store.svelte.js";
  import TextArea from "$shared/components/inputs/TextArea.svelte";
  import Block from "$shared/components/layout/Block.svelte";
  import Section from "$shared/components/layout/Section.svelte";
  import { dict } from "$shared/locales/ru.js";

  let { errors = {} } = $props();
</script>

<Block title={dict.steps.freeMic.title} icon="campaign">
  <Section isFirst={true}>
    <TextArea
      label={dict.steps.freeMic.commentLabel}
      placeholder={dict.steps.freeMic.commentPlaceholder}
      helperText={dict.steps.freeMic.commentHint}
      icon="edit_note"
      bind:value={formStore.data.freeMic}
      errorText={errors["freeMic"]}
      onblur={() => formStore.markTouched("freeMic")}
    />
  </Section>
</Block>
