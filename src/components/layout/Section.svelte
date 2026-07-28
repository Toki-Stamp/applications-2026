<script>
  import { onMount } from "svelte";

  let { title = "", isFirst = false, gap = "1rem", children } = $props();

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

<div class="section-container" class:first-section={isFirst}>
  {#if title}
    <div bind:this={sentinelEl} class="sticky-sentinel"></div>
    <h3 class="section-title glass-header glass-header-accent" class:is-stuck={isStuck}>{title}</h3>
  {/if}
  <div class="section-content" style="--section-gap: {gap};">
    {@render children?.()}
  </div>
</div>

<style>
  .sticky-sentinel {
    position: relative;
    top: -1px;
    height: 1px;
    margin-bottom: -1px;
    pointer-events: none;
    visibility: hidden;
  }

  .section-container {
    display: flex;
    flex-direction: column;
    gap: var(--gap-section);
  }

  .section-title {
    font-size: var(--text-lg);
    color: var(--accent);

    min-height: 52px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    /* Full-bleed out of Block content padding using token */
    margin: 0 calc(var(--layout-px-base) * -1) 0 calc(var(--layout-px-base) * -1);
    padding: var(--title-py-sm) var(--layout-px-base);

    /* Sticky behavior: stacks under .block-title */
    position: sticky;
    top: calc(var(--sticky-block-offset) - 2px); /* 2px compensation for sticky header gap */
    z-index: 25;
  }

  /* Compensate gap for the first section to stick directly to main title */
  .first-section .section-title {
    margin-top: calc(var(--layout-py-base) * -1);
  }

  .section-content {
    display: flex;
    flex-direction: column;
  }

  .section-content > :global(* + *) {
    margin-top: var(--section-gap, var(--gap-fields));
  }
</style>
