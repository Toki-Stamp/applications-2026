<script>
  import { formStore } from "../store.svelte.js";
  import TextArea from "../components/fields/TextArea.svelte";
  import Block from "../components/layout/Block.svelte";
  import Section from "../components/layout/Section.svelte";
  import { dict } from "../locales/ru.js";

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
