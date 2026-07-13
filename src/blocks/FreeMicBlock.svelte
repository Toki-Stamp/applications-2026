<script>
  import { formStore } from "../store.js";
  import TextArea from "../components/TextArea.svelte";

  /** @type {any} */
  let commentInput;

  export function validate(forceTouch = false) {
    let errors = [];
    if (commentInput && typeof commentInput.validate === 'function' && !commentInput.validate(forceTouch)) errors.push(commentInput.label || "Свободный микрофон");
    return errors;
  }
</script>

<div class="block-card">
  <h2 class="block-title">Свободный микрофон</h2>
  <div class="section-container first-section">
    <div class="section-content">
      <TextArea
        bind:this={commentInput}
        label="Комментарий или пожелания"
        placeholder="Напишите здесь всё, что считаете важным..."
        icon="edit_note"
        bind:value={$formStore.freeMic}
      />
    </div>
  </div>
</div>

<style>
</style>
