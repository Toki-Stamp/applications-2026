<script>
  let { text = "", pos = "bottom", onlyIfTruncated = false, caps = true, children } = $props();

  let isTruncated = $state(false);

  /** @param {Event} e */
  function checkTruncation(e) {
    if (!onlyIfTruncated) return;
    const target = /** @type {HTMLElement} */ (e.currentTarget);
    const child = target.firstElementChild;
    if (child) {
      isTruncated = child.scrollWidth > child.clientWidth;
    }
  }
</script>

{#if text}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="tooltip-wrapper" 
    class:hover-enabled={!onlyIfTruncated || isTruncated}
    class:caps={caps}
    data-tooltip={text} 
    data-tooltip-pos={pos}
    onmouseenter={checkTruncation}
  >
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
    border: 1px solid color-mix(in srgb, var(--primary-color, var(--primary)) 40%, var(--border-color));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);

    padding: calc(var(--gap-sm) * 1.2) calc(var(--gap-fields) * 0.8);
    border-radius: 8px;
    font-size: var(--text-sm);
    font-family: var(--font-family);
    font-weight: var(--font-weight-normal);
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.15s ease,
      visibility 0.15s ease,
      transform 0.15s ease;
    z-index: 1000;
  }

  .tooltip-wrapper.caps::after {
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .tooltip-wrapper.hover-enabled:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) scale(1);
  }

  .tooltip-wrapper[data-tooltip-pos="left"]::after {
    left: 0;
    transform: translateX(0) scale(0.9);
  }

  .tooltip-wrapper[data-tooltip-pos="left"].hover-enabled:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(0) scale(1);
  }

  .tooltip-wrapper[data-tooltip-pos="right"]::after {
    left: auto;
    right: 0;
    transform: translateX(0) scale(0.9);
  }

  .tooltip-wrapper[data-tooltip-pos="right"].hover-enabled:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(0) scale(1);
  }
</style>
