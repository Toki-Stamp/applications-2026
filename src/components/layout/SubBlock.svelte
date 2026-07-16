<script>
  let {
    title = "",
    stickyLevel = 3, // 2 = stick under main block title, 3 = stick under section title
    children,
  } = $props();
</script>

<div class="sub-block-card level-{stickyLevel}">
  {#if title}
    <h3 class="sub-block-title glass-header glass-header-accent">
      {@html title}
    </h3>
  {/if}

  <div class="sub-block-content">
    {#if children}{@render children()}{/if}
  </div>
</div>

<style>
  .sub-block-card {
    background-color: rgba(255, 255, 255, 0.02);
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
    border-left: 4px solid var(--accent);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .sub-block-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sub-block-title {
    color: var(--accent);
    font-size: 1.1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: -1.5rem -1.5rem 1.25rem -1.5rem;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    border-radius: 8px 8px 0 0;
    position: sticky;
    z-index: 20;
  }

  .sub-block-card.level-2 .sub-block-title {
    top: calc(var(--sticky-block-offset) - 2px);
  }
  .sub-block-card.level-3 .sub-block-title {
    top: calc(var(--sticky-section-offset) - 2px);
  }

  @media (max-width: 600px) {
    .sub-block-card {
      padding: 1rem;
    }
    .sub-block-title {
      margin: -1rem -1rem 1rem -1rem;
      padding: 0.75rem 1rem;
    }
  }
</style>
