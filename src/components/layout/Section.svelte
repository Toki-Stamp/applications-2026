<script>
  let { title = "", isFirst = false, children } = $props();
</script>

<div class="section-container" class:first-section={isFirst}>
  {#if title}
    <h3 class="section-title glass-header glass-header-accent">{title}</h3>
  {/if}
  <div class="section-content">
    {@render children?.()}
  </div>
</div>

<style>
  .section-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section-title {
    font-size: 1.1rem;
    color: var(--accent);

    min-height: 52px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    margin: 0 -2rem 0 -2rem;
    padding: 0.75rem 2rem;

    /* Sticky behavior: stacks under .block-title */
    position: sticky;
    top: calc(var(--sticky-block-offset) - 2px);
    z-index: 25;
  }

  /* Compensate gap for the first section to stick directly to main title */
  .first-section .section-title {
    margin-top: -1.5rem;
  }

  .section-content {
    display: flex;
    flex-direction: column;
  }

  .section-content > :global(* + *) {
    margin-top: 1rem;
  }

  @media (max-width: 600px) {
    .section-title {
      margin: 0 -1.25rem 0 -1.25rem;
      padding: 0.75rem 1.25rem;
    }
  }
</style>
