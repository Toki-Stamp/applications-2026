<script>
  import { fade, scale } from "svelte/transition";
  import { portal } from "$shared/utils/portal.js";
  import { floating } from "$shared/actions/floating.js";

  let {
    text = "",
    pos = "top",
    onlyIfTruncated = false,
    variant = "default",
    enabled = true,
    forceVisible = false,
    offset = 10,
    wrapperClass = "",
    children,
  } = $props();

  let isTruncated = $state(false);
  let isHovered = $state(false);
  let isVisible = $derived(forceVisible || isHovered);

  /** @type {HTMLElement | null} */
  let wrapperNode = $state(null);

  /** @type {any} */
  let longPressTimer = null;
  let isLongPressActive = false;
  let isPinnedOnTouch = false;

  function dismissPinned() {
    if (isPinnedOnTouch) {
      isHovered = false;
      isPinnedOnTouch = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("pointerdown", dismissPinned, true);
        window.removeEventListener("scroll", dismissPinned, true);
      }
    }
  }

  /** @param {Event} e */
  function handleMouseEnter(e) {
    if (!enabled) return;

    // Ignore mouseenter on touch devices
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return;

    if (onlyIfTruncated) {
      const target = /** @type {HTMLElement} */ (e.currentTarget);
      const child = target.firstElementChild;
      if (child) {
        isTruncated = child.scrollWidth > child.clientWidth;
      }
    }

    if (!onlyIfTruncated || isTruncated) {
      isHovered = true;
    }
  }

  function handleMouseLeave() {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return;
    isHovered = false;
  }

  /** @param {TouchEvent} e */
  function handleTouchStart(e) {
    if (!enabled || !text) return;

    // If a pinned tooltip is currently showing, tap dismisses it
    if (isPinnedOnTouch) {
      dismissPinned();
      return;
    }

    clearTimeout(longPressTimer);
    isLongPressActive = false;

    // Trigger long press tooltip after 400ms hold
    longPressTimer = setTimeout(() => {
      isLongPressActive = true;
      isHovered = true;
      isPinnedOnTouch = true;

      // Soft haptic feedback if supported
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(20);
        } catch (_) {}
      }

      // Attach global click-outside and scroll dismiss listeners
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.addEventListener("pointerdown", dismissPinned, { capture: true, once: true });
          window.addEventListener("scroll", dismissPinned, { capture: true, once: true });
        }
      }, 100);
    }, 400);
  }

  /** @param {TouchEvent} e */
  function handleTouchEnd(e) {
    clearTimeout(longPressTimer);
    if (isLongPressActive) {
      if (e.cancelable) e.preventDefault();
      isLongPressActive = false;
    } else if (!isPinnedOnTouch) {
      isHovered = false;
    }
  }

  function handleTouchCancel() {
    clearTimeout(longPressTimer);
    if (!isPinnedOnTouch) {
      isLongPressActive = false;
      isHovered = false;
    }
  }
</script>

{#if text}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_mouse_events_have_key_events -->
  <div
    class="tooltip-wrapper {wrapperClass}"
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    ontouchcancel={handleTouchCancel}
    bind:this={wrapperNode}
    data-tooltip={text || undefined}
  >
    {#if children}{@render children()}{/if}
    {#if enabled && isVisible && wrapperNode}
      <div
        class="tooltip-content {variant === 'neon' ? 'glass-panel neon' : ''}"
        use:portal
        use:floating={{ referenceNode: wrapperNode, placement: pos, offsetValue: offset }}
        transition:scale={{ start: 0.9, duration: 150 }}
      >
        {text}
      </div>
    {/if}
  </div>
{:else}
  {#if children}{@render children()}{/if}
{/if}

<style>
  .tooltip-wrapper {
    position: relative;
    overflow: visible !important;
    display: inline-flex;
  }

  :global(.tooltip-content) {
    position: fixed;
    top: 0;
    left: 0;
    /* Match ThemeSwitcher Tooltip */
    background: color-mix(in srgb, var(--bg-color-accent) 95%, transparent);
    color: var(--text-primary) !important;
    border: 1px solid
      color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 40%,
        var(--border-color)
      );
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
    z-index: 10000; /* Ensure it stays above everything */
  }

  /* Neon variant */
  :global(.tooltip-content.neon) {
    border: 1px solid var(--glass-border-hover) !important;
    box-shadow:
      0 10px 40px -10px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(139, 92, 246, 0.2) !important;
    background: var(--bg-color-accent) !important;
  }

  :global(.tooltip-content.neon::before) {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 9px;
    z-index: -1;
    pointer-events: none;
    background: linear-gradient(
      135deg,
      var(--primary) 0%,
      rgba(255, 255, 255, 0) 50%,
      var(--accent) 100%
    ) !important;
  }
</style>
