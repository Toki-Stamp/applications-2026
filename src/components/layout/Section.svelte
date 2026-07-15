<script>
  let { title = "", isFirst = false, children } = $props();
  let titleHeight = $state(0);
</script>

<div class="section-container" class:first-section={isFirst}>
  {#if title}
    <h3 class="section-title">{title}</h3>
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
    top: calc(var(--sticky-block-offset) - 1px);
    z-index: 25;

    background: var(--bg-color-accent);
    background: linear-gradient(to right, color-mix(in srgb, var(--accent) 8%, transparent), transparent),
                linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03)), 
                color-mix(in srgb, var(--bg-color-accent) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.02);
  }

  /* Compensate gap for the first section to stick directly to main title */
  .first-section .section-title {
    margin-top: -1.5rem;
  }

  .section-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
