<script>
  import { formStore } from "../store.js";
  import TextArea from "../components/TextArea.svelte";
</script>

<div class="block-card">
  <h2 class="block-title">Свободный микрофон</h2>
  <div class="section-container first-section">
    <TextArea
      label="Комментарий или пожелания"
      placeholder="Напишите здесь всё, что считаете важным..."
      icon="edit_note"
      bind:value={$formStore.freeMic}
    />
  </div>
</div>

<style>
</style>
