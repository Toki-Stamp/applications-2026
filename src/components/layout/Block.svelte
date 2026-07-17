<script>
  let { title = "", icon = "", align = "left", children } = $props();
</script>

<div class="block-card glass-panel">
  {#if title}
    <h2 class="block-title glass-header glass-header-primary align-{align}">
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
  /* Glassmorphism Cards */
  .block-card {
    position: relative;
    z-index: 10;
    overflow: visible;
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
    box-shadow:
      0 10px 40px -10px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(139, 92, 246, 0.1);
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
      box-shadow:
        0 10px 40px -10px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(139, 92, 246, 0.1);
    }

    .block-title {
      top: -1px;
      font-size: var(--text-lg);
    }
  }
</style>
