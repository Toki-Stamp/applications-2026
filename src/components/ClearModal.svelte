<script>
  import { fade, scale } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (event.key === "Escape") {
      dispatch("cancel");
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="modal-overlay"
  transition:fade={{ duration: 200 }}
  on:click={() => dispatch("cancel")}
>
  <div
    class="block-card modal-card"
    transition:scale={{ start: 0.95, duration: 200 }}
    on:click|stopPropagation
  >
    <h2 class="block-title">Очистить форму?</h2>
    <div class="modal-content">
      <p>Вы уверены, что хотите безвозвратно удалить все введенные данные?</p>
    </div>
    <div class="modal-actions">
      <button
        type="button"
        class="btn-secondary"
        on:click={() => dispatch("cancel")}
      >
        Отмена
      </button>
      <button
        type="button"
        class="btn-danger"
        on:click={() => dispatch("confirm")}
      >
        Очистить
      </button>
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

  .modal-card .block-title {
    position: relative;
    top: 0;
    box-shadow: none;
  }

  .modal-content {
    font-size: 1.05rem;
    text-align: center;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: stretch;
  }

  .modal-actions button {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
