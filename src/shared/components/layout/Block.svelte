<script>
  import { onMount } from "svelte";

  /**
   * @typedef {Object} Props
   * @property {string} [title]
   * @property {string} [icon]
   * @property {"left" | "center"} [align]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { title = "", icon = "", align = "left", children } = $props();

  /** @type {HTMLDivElement | null} */
  let sentinelEl = $state(null);
  let isStuck = $state(false);

  onMount(() => {
    if (!sentinelEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isStuck = !entry.isIntersecting;
      },
      { threshold: [1.0] },
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
  });
</script>

<div class="block-card glass-panel">
  {#if title}
    <h2
      class="block-title glass-header glass-header-primary align-{align}"
      class:is-stuck={isStuck}
    >
      <div bind:this={sentinelEl} class="sticky-sentinel"></div>
      {#if icon}
        <md-icon class="title-icon">{icon}</md-icon>
      {/if}
      {title}
    </h2>
  {/if}
  <div class="block-content">
    {@render children?.()}
  </div>
</div>

<style>
  .sticky-sentinel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    pointer-events: none;
    visibility: hidden;
  }

  /* Glassmorphism Cards */
  .block-card {
    position: relative;
    z-index: 10;
    overflow: visible;
    box-shadow: var(--shadow-md);
    transition: var(--transition);
  }

  .block-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-section);
    padding: var(--layout-py-base) var(--layout-px-base);
  }

  .block-card:hover {
    border-color: var(--glass-border-hover);
    box-shadow: var(--shadow-lg), var(--shadow-glow-primary);
  }

  .block-title {
    font-size: var(--text-xl);
    padding: var(--title-py-lg) var(--layout-px-base);
    border-radius: calc(var(--border-radius) - 1px)
      calc(var(--border-radius) - 1px) 0 0;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    line-height: var(--line-height-normal);
    gap: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    /* Smart sticky header */
    position: sticky;
    top: -1px;
    z-index: 30;
  }

  .block-title.align-left {
    justify-content: flex-start;
    text-align: left;
  }

  .block-title.align-center {
    justify-content: center;
    text-align: center;
  }

  .title-icon {
    font-size: 1.3em; /* Slightly larger than text */
    color: inherit;
  }

  @media (max-width: 600px) {
    .block-card {
      border-color: var(--glass-border-hover);
      box-shadow: var(--shadow-md);
    }

    .block-title {
      top: -1px;
      font-size: var(--text-lg);
    }
  }
</style>
