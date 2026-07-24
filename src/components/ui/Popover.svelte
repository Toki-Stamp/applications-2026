<script>
  import { scale, fade } from "svelte/transition";

  let {
    isOpen = false,
    onclose,
    pos = "bottom-right", // 'bottom-right' | 'bottom-left'
    width = "auto",
    backdrop = false,
    children,
  } = $props();
</script>

{#if isOpen}
  {#if backdrop}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="popover-backdrop" onclick={() => onclose && onclose()} transition:fade={{ duration: 150 }}></div>
  {/if}

  <div
    class="popover-wrapper"
    data-pos={pos}
    style:width={width}
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
    position: absolute;
    z-index: 100;
  }

  .popover-wrapper[data-pos="bottom-right"] {
    top: calc(100% + 10px);
    right: 0;
    transform-origin: top right;
  }

  .popover-wrapper[data-pos="bottom-left"] {
    top: calc(100% + 10px);
    left: 0;
    transform-origin: top left;
  }

  .popover-content.glass-panel {
    background: var(--bg-color-accent);
    border: 1px solid var(--glass-border-hover);
    box-shadow:
      0 10px 40px -10px rgba(0, 0, 0, 0.5),
      0 0 30px color-mix(in srgb, var(--primary) 20%, transparent);
    border-radius: 12px;
    position: relative;
    /* allow scrolling inside if needed, but child should handle it */
    overflow: hidden; 
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
