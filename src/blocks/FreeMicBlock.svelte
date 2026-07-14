<script>
  import { formStore } from "../store.svelte.js";
  import TextArea from "../components/TextArea.svelte";

  let { errors = {} } = $props();
</script>

<div class="block-card">
  <h2 class="block-title">Свободный микрофон</h2>
  <div class="section-container first-section">
    <div class="section-content">
      <TextArea
        label="Комментарий или пожелания"
        placeholder="Напишите здесь всё, что считаете важным..."
        icon="edit_note"
        bind:value={formStore.data.freeMic}
        errorText={errors['freeMic']}
        onblur={() => formStore.markTouched('freeMic')}
      />
    </div>
  </div>
</div>

<style>
</style>
