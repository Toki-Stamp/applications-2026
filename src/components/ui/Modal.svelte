<script>
  import { fade, scale } from "svelte/transition";
  import Block from "../layout/Block.svelte";

  /** @type {{ title?: string, variant?: string, dismissible?: boolean, onclose?: () => void, children?: import('svelte').Snippet, actions?: import('svelte').Snippet }} */
  let {
    title = "",
    variant = "default",
    dismissible = true,
    onclose,
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
  <div
    class="modal-wrapper variant-{variant}"
    transition:scale={{ start: 0.95, duration: 200 }}
    onclick={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <Block {title} align="center">
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
    </Block>
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
    padding: var(--layout-py-sm) var(--layout-px-sm);
  }

  .modal-wrapper {
    width: 100%;
    max-width: 450px;
    margin: 0;
  }

  .variant-danger :global(.block-card) {
    box-shadow:
      0 20px 50px -10px rgba(0, 0, 0, 0.6),
      0 0 40px rgba(220, 38, 38, 0.25);
    border-color: rgba(220, 38, 38, 0.4);
    background: color-mix(
      in srgb,
      var(--glass-bg) 80%,
      rgba(220, 38, 38, 0.15)
    ) !important;
  }

  .variant-danger :global(.block-card::before) {
    background: linear-gradient(
      135deg,
      rgba(220, 38, 38, 0.5) 0%,
      transparent 50%,
      rgba(220, 38, 38, 0.1) 100%
    ) !important;
  }

  .variant-danger :global(.block-title) {
    color: var(--error-color);
    border-bottom-color: rgba(220, 38, 38, 0.3);
    background:
      linear-gradient(to right, rgba(220, 38, 38, 0.25), transparent),
      color-mix(in srgb, var(--bg-color-accent) 90%, transparent) !important;
  }

  .variant-danger :global(.block-title::before),
  .variant-danger :global(.block-title::after) {
    background: linear-gradient(135deg, #ef4444, #991b1b) !important;
    box-shadow: 0 0 8px #dc2626 !important;
  }

  .modal-content {
    font-size: var(--text-base);
    text-align: center;
    color: var(--text-primary);
    line-height: var(--line-height-normal);
  }

  .modal-actions {
    display: flex;
    gap: var(--gap-fields);
    justify-content: stretch;
  }

  .modal-actions :global(button) {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
