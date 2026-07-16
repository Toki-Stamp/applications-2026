<script>
  let { title = "", children } = $props();
</script>

<div class="block-card glass-panel">
  {#if title}
    <h2 class="block-title glass-header glass-header-primary">{title}</h2>
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
    justify-content: center;
    text-align: center;
    line-height: 1.4;
    gap: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    /* Smart sticky header */
    position: sticky;
    top: -1px;
    z-index: 30;
  }

  /* Add a tiny accent dot to titles */
  .block-title::before,
  .block-title::after {
    content: "";
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    box-shadow: 0 0 8px var(--primary);
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
