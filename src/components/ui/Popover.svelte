<script>
  import { scale, fade } from "svelte/transition";
  import { portal } from '../../utils/portal.js';
  import { floating } from '../../actions/floating.js';

  let {
    isOpen = false,
    onclose,
    pos = "bottom-right", // 'bottom-right' | 'bottom-left'
    width = "auto",
    backdrop = false,
    referenceNode, // REQUIRED
    children,
  } = $props();
</script>

{#if isOpen && referenceNode}
  {#if backdrop}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="popover-backdrop" use:portal onclick={() => onclose && onclose()} transition:fade={{ duration: 150 }}></div>
  {/if}

  <div
    class="popover-wrapper"
    style:width={width}
    use:portal
    use:floating={{ referenceNode, placement: pos }}
    transition:scale={{ start: 0.95, duration: 150 }}
  >
    <div class="popover-content glass-panel">
      {#if children}{@render children()}{/if}
    </div>
  </div>
{/if}

<style>
  .popover-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 90;
    background: transparent;
    cursor: default;
  }

  .popover-wrapper {
    position: fixed;
    z-index: 100;
  }

  .popover-content.glass-panel {
    background: var(--bg-color-accent);
    border: 1px solid var(--glass-border-hover);
    box-shadow:
      0 10px 40px -10px rgba(0, 0, 0, 0.5),
      0 0 30px color-mix(in srgb, var(--primary) 20%, transparent);
    border-radius: var(--border-radius);
    position: relative;
    /* allow scrolling inside if needed, but child should handle it */
    overflow: hidden;
    max-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;
  }

  .popover-content.glass-panel::before {
    opacity: 1;
    background: linear-gradient(
      135deg,
      var(--primary) 0%,
      rgba(255, 255, 255, 0) 50%,
      var(--accent) 100%
    );
  }
</style>
