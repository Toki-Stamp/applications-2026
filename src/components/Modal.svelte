<script>
  import { fade, scale } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let variant = "default"; // 'default' or 'danger'

  const dispatch = createEventDispatcher();

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (event.key === "Escape") {
      dispatch("close");
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="modal-overlay"
  transition:fade={{ duration: 200 }}
  on:click={() => dispatch("close")}
>
  <div
    class="block-card modal-card variant-{variant}"
    transition:scale={{ start: 0.95, duration: 200 }}
    on:click|stopPropagation
  >
    <slot name="header"></slot>
    
    <div class="modal-content">
      <slot></slot>
    </div>
    
    <div class="modal-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(9, 9, 11, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .modal-card {
    width: 100%;
    max-width: 450px;
    margin: 0;
    box-shadow:
      0 20px 50px -10px rgba(0, 0, 0, 0.5),
      0 0 30px var(--primary-glow);
  }

  .variant-danger {
    box-shadow:
      0 20px 50px -10px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(220, 38, 38, 0.3);
  }

  .modal-card :global(.block-title) {
    position: relative;
    top: 0;
    box-shadow: none;
  }

  .variant-danger :global(.block-title) {
    color: #fca5a5;
    border-bottom-color: rgba(220, 38, 38, 0.2);
  }

  .modal-content {
    font-size: 1.05rem;
    text-align: center;
    color: var(--text-primary);
    line-height: 1.5;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: stretch;
  }

  .modal-actions :global(button) {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
