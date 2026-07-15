<script>
  import { fade, scale } from "svelte/transition";

  /** @type {{ variant?: string, dismissible?: boolean, onclose?: () => void, header?: import('svelte').Snippet, children?: import('svelte').Snippet, actions?: import('svelte').Snippet }} */
  let {
    variant = 'default',
    dismissible = true,
    onclose,
    header,
    children,
    actions,
  } = $props();

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (dismissible && event.key === "Escape") {
      onclose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="modal-overlay"
  transition:fade={{ duration: 200 }}
  onclick={() => dismissible && onclose?.()}
  role="presentation"
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="block-card modal-card variant-{variant}"
    transition:scale={{ start: 0.95, duration: 200 }}
    onclick={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    {#if header}
      {@render header()}
    {/if}

    <div class="modal-content">
      {#if children}
        {@render children()}
      {/if}
    </div>

    {#if actions}
      <div class="modal-actions">
        {@render actions()}
      </div>
    {/if}
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: color-mix(in srgb, var(--bg-color) 85%, transparent);
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
      0 20px 50px -10px color-mix(in srgb, var(--text-primary) 30%, transparent),
      0 0 30px var(--primary-glow);
    background: var(--glass-bg);
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

  .variant-danger :global(.block-title::before),
  .variant-danger :global(.block-title::after) {
    background: linear-gradient(135deg, #ef4444, #991b1b) !important;
    box-shadow: 0 0 8px #dc2626 !important;
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
