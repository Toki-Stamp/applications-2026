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
</style>
