<script>
  let { text = "", pos = "bottom", children } = $props();
</script>

{#if text}
  <div class="tooltip-wrapper" data-tooltip={text} data-tooltip-pos={pos}>
    {@render children()}
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .tooltip-wrapper {
    position: relative;
    overflow: visible !important;
    display: inline-flex;
    /* Removed flex: inherit to prevent layout bugs */
  }

  .tooltip-wrapper::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);

    /* Match ThemeSwitcher Tooltip */
    background: color-mix(in srgb, var(--bg-color-accent) 95%, transparent);
    color: var(--text-primary) !important;
    border: 1px solid var(--border-color);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);

    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-family: var(--font-family);
    font-weight: normal;
    text-transform: uppercase;
    letter-spacing: 1px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
    z-index: 1000;
  }

  .tooltip-wrapper:hover::after {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }

  .tooltip-wrapper[data-tooltip-pos="left"]::after {
    left: 0;
    transform: translateX(0) scale(0.9);
  }

  .tooltip-wrapper[data-tooltip-pos="left"]:hover::after {
    transform: translateX(0) scale(1);
  }

  .tooltip-wrapper[data-tooltip-pos="right"]::after {
    left: auto;
    right: 0;
    transform: translateX(0) scale(0.9);
  }

  .tooltip-wrapper[data-tooltip-pos="right"]:hover::after {
    transform: translateX(0) scale(1);
  }
</style>
