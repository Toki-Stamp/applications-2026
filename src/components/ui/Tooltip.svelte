<script>
  let { text = "", pos = "top", onlyIfTruncated = false, caps = true, variant = "default", enabled = true, children } = $props();

  let isTruncated = $state(false);
  
  /** @type {string} */
  let computedPos = $state("");
  
  /** @type {HTMLElement | null} */
  let wrapperNode = $state(null);
  
  /** @type {HTMLElement | null} */
  let contentNode = $state(null);

  $effect(() => {
    // Reset to prop pos whenever prop pos changes
    computedPos = pos;
  });

  /** @param {Event} e */
  function handleMouseEnter(e) {
    if (!enabled) return;

    // 1. Check truncation
    if (onlyIfTruncated) {
      const target = /** @type {HTMLElement} */ (e.currentTarget);
      const child = target.firstElementChild;
      if (child) {
        isTruncated = child.scrollWidth > child.clientWidth;
      }
    }

    // 2. Smart positioning
    if ((!onlyIfTruncated || isTruncated) && wrapperNode && contentNode) {
      const rect = wrapperNode.getBoundingClientRect();
      const tooltipWidth = contentNode.offsetWidth || 150;
      const tooltipHeight = contentNode.offsetHeight || 40;

      let newPos = pos;

      // Vertical Check
      const boundary = wrapperNode.closest('.table-wrapper') || document.body;
      const boundaryRect = boundary.getBoundingClientRect();

      const spaceAbove = rect.top - boundaryRect.top;
      const spaceBelow = boundaryRect.bottom - rect.bottom;
      const isTopRequested = newPos === 'top' || newPos === 'left' || newPos === 'right';

      if (isTopRequested && spaceAbove < tooltipHeight + 10 && spaceBelow >= tooltipHeight + 10) {
        if (newPos === 'top') newPos = 'bottom';
        else if (newPos === 'left') newPos = 'bottom-left';
        else if (newPos === 'right') newPos = 'bottom-right';
      } else if (!isTopRequested && spaceBelow < tooltipHeight + 10 && spaceAbove >= tooltipHeight + 10) {
        if (newPos === 'bottom') newPos = 'top';
        else if (newPos === 'bottom-left') newPos = 'left';
        else if (newPos === 'bottom-right') newPos = 'right';
      }

      // Horizontal Check
      const spaceLeft = (rect.left + rect.width / 2) - boundaryRect.left;
      const spaceRight = boundaryRect.right - (rect.right - rect.width / 2);
      const safeMargin = 12;

      if (newPos === 'top' || newPos === 'bottom') {
        if (spaceLeft < tooltipWidth / 2 + safeMargin) {
          newPos = newPos === 'top' ? 'left' : 'bottom-left';
        } else if (spaceRight < tooltipWidth / 2 + safeMargin) {
          newPos = newPos === 'top' ? 'right' : 'bottom-right';
        }
      }

      computedPos = newPos;
    }
  }
</script>

{#if text}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="tooltip-wrapper" 
    class:hover-enabled={(!onlyIfTruncated || isTruncated) && enabled}
    class:caps={caps}
    data-tooltip-pos={computedPos}
    data-tooltip={text}
    onmouseenter={handleMouseEnter}
    bind:this={wrapperNode}
  >
    {@render children()}
    {#if enabled}
      <div 
        class="tooltip-content {variant === 'neon' ? 'glass-panel neon' : ''}"
        bind:this={contentNode}
      >
        {text}
      </div>
    {/if}
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .tooltip-wrapper {
    position: relative;
    overflow: visible !important;
    display: inline-flex;
  }

  .tooltip-content {
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

  .tooltip-wrapper.caps .tooltip-content {
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .tooltip-wrapper.hover-enabled:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) scale(1);
  }

  .tooltip-wrapper[data-tooltip-pos="left"] .tooltip-content {
    left: 0;
    transform: translateX(0) scale(0.9);
  }

  .tooltip-wrapper[data-tooltip-pos="left"].hover-enabled:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(0) scale(1);
  }

  .tooltip-wrapper[data-tooltip-pos="right"] .tooltip-content {
    left: auto;
    right: 0;
    transform: translateX(0) scale(0.9);
  }

  .tooltip-wrapper[data-tooltip-pos="right"].hover-enabled:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(0) scale(1);
  }

  .tooltip-wrapper[data-tooltip-pos="bottom"] .tooltip-content {
    bottom: auto;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
  }

  .tooltip-wrapper[data-tooltip-pos="bottom"].hover-enabled:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) scale(1);
  }

  .tooltip-wrapper[data-tooltip-pos="bottom-left"] .tooltip-content {
    bottom: auto;
    top: calc(100% + 10px);
    left: 0;
    transform: translateX(0) scale(0.9);
  }

  .tooltip-wrapper[data-tooltip-pos="bottom-left"].hover-enabled:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(0) scale(1);
  }

  .tooltip-wrapper[data-tooltip-pos="bottom-right"] .tooltip-content {
    bottom: auto;
    top: calc(100% + 10px);
    left: auto;
    right: 0;
    transform: translateX(0) scale(0.9);
  }

  .tooltip-wrapper[data-tooltip-pos="bottom-right"].hover-enabled:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(0) scale(1);
  }

  /* Neon variant */
  .tooltip-content.neon {
    border: 1px solid var(--glass-border-hover) !important;
    box-shadow:
      0 10px 40px -10px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(139, 92, 246, 0.2) !important;
    background: var(--bg-color-accent) !important;
  }
  
  .tooltip-content.neon::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 9px;
    z-index: -1;
    pointer-events: none;
    background: linear-gradient(135deg,
        var(--primary) 0%,
        rgba(255, 255, 255, 0) 50%,
        var(--accent) 100%) !important;
  }
</style>
