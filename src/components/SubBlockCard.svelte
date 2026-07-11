<script>
  export let title = "";
  export let stickyLevel = 3; // 2 = stick under main block title, 3 = stick under section title
</script>

<div class="sub-block-card level-{stickyLevel}">
  {#if title}
    <h3 class="sub-block-title">{@html title}</h3>
  {/if}
  <slot name="title"></slot>

  <div class="sub-block-content">
    <slot></slot>
  </div>
</div>

<style>
  .sub-block-card {
    background-color: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
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

    background: rgba(30, 30, 35, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 8px 8px 0 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 10px -5px rgba(0, 0, 0, 0.3);
    position: sticky;
    z-index: 38;
  }

  .sub-block-card.level-2 .sub-block-title {
    top: calc(
      var(--header-height, 100px) + var(--block-title-height, 69px) - 2px
    );
  }
  .sub-block-card.level-3 .sub-block-title {
    top: calc(
      var(--header-height, 100px) + var(--block-title-height, 69px) +
        var(--section-title-height, 52px) - 3px
    );
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
