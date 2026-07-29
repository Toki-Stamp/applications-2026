<script>
  import { onMount } from "svelte";

  let {
    title = "",
    stickyLevel = 3, // 2 = stick under main block title, 3 = stick under section title
    children,
  } = $props();

  /** @type {HTMLDivElement | null} */
  let sentinelEl = $state(null);
  let isStuck = $state(false);

  onMount(() => {
    if (!sentinelEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isStuck = !entry.isIntersecting;
      },
      { threshold: [1.0] }
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
  });
</script>

<div class="sub-block-card level-{stickyLevel}">
  {#if title}
    <h3 class="sub-block-title glass-header glass-header-accent" class:is-stuck={isStuck}>
      <div bind:this={sentinelEl} class="sticky-sentinel"></div>
      {@html title}
    </h3>
  {/if}

  <div class="sub-block-content">
    {#if children}{@render children()}{/if}
  </div>
</div>

<style>
  .sticky-sentinel {
    position: absolute;
    top: -1px;
    left: 0;
    width: 100%;
    height: 1px;
    pointer-events: none;
    visibility: hidden;
  }
  .sub-block-card {
    background-color: rgba(255, 255, 255, 0.02);
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
    border-left: 4px solid var(--accent);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    position: relative;
  }

  .sub-block-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-fields);
    padding: var(--layout-py-sm) var(--layout-px-sm);
  }

  .sub-block-title {
    color: var(--accent);
    font-size: var(--text-lg);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: var(--title-py-md) var(--layout-px-sm);
    display: flex;
    align-items: center;
    gap: 0.5rem;

    border-radius: calc(var(--radius-sm) - 1px) calc(var(--radius-sm) - 1px) 0 0;
    position: sticky;
    z-index: 20;
  }

  .sub-block-card.level-2 .sub-block-title {
    top: calc(var(--sticky-block-offset) - 2px);
  }
  .sub-block-card.level-3 .sub-block-title {
    top: calc(var(--sticky-section-offset) - 2px);
  }
</style>
