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
  {@render children?.()}
</div>

<style>
  /* Glassmorphism Cards */
  .block-card {
    padding: 2rem;
    position: relative;
    z-index: 10;
    overflow: visible;
    transition: var(--transition);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .block-card:hover {
    border-color: var(--glass-border-hover);
    box-shadow:
      0 10px 40px -10px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(139, 92, 246, 0.1);
  }

  .block-title {
    font-size: 1.25rem;
    padding: 1.125rem 2rem;
    margin: -2rem -2rem 0 -2rem;
    border-radius: calc(var(--border-radius) - 1px)
      calc(var(--border-radius) - 1px) 0 0;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    line-height: 1.4;
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
      padding: 1.25rem;
      border-color: var(--glass-border-hover);
      box-shadow:
        0 10px 40px -10px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(139, 92, 246, 0.1);
    }

    .block-title {
      top: -1px;
      padding: 1rem 1.25rem;
      margin: -1.25rem -1.25rem 0 -1.25rem;
      font-size: 1.1rem;
    }
  }
</style>
