<script>
  import { formStore } from "../store.svelte.js";
  import TextArea from "../components/fields/TextArea.svelte";
  import Block from "../components/layout/Block.svelte";
  import Section from "../components/layout/Section.svelte";

  let { errors = {} } = $props();
</script>

<Block title="Свободный микрофон">
  <Section isFirst={true}>
    <TextArea
      label="Комментарий или пожелания"
      placeholder="Напишите здесь всё, что считаете важным..."
      helperText="В этом пункте Вы можете уточнить любые детали или добавить информацию, которая не вошла в предыдущие шаги заявки"
      icon="edit_note"
      bind:value={formStore.data.freeMic}
      errorText={errors["freeMic"]}
      onblur={() => formStore.markTouched("freeMic")}
    />
  </Section>
</Block>

<style>
</style>
