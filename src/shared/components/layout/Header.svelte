<script>
  import ProgressBar from "$shared/components/ui/ProgressBar.svelte";
  import { dict } from "$shared/locales/ru.js";

  let {
    currentStep = 0,
    totalSteps = 0,
    headerHeight = $bindable(0),
    leftAction = undefined,
    rightAction = undefined,
    title = undefined,
  } = $props();

  let headerWidth = $state(0);
</script>

<header class="app-header" bind:clientHeight={headerHeight}>
  <div
    class="header-content"
    bind:clientWidth={headerWidth}
    style="--header-content-width: {headerWidth}px;"
  >
    <div class="header-top-row">
      {#if leftAction}
        <div class="action-container left">
          {@render leftAction()}
        </div>
      {/if}

      <div class="title-container">
        <h1>
          <img src="/favicon.svg" alt="Z" class="title-icon" />
          <span class="title-text">{title || dict.layout.header.titleText}</span>
        </h1>
      </div>

      {#if rightAction}
        <div class="action-container right">
          {@render rightAction()}
        </div>
      {/if}
    </div>
  </div>

  {#if currentStep > 1}
    <ProgressBar {currentStep} {totalSteps} />
  {/if}
</header>

<style>
  .app-header {
    position: relative;
    width: 100%;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--bg-color) 70%, transparent);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    z-index: 60;
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  }

  .header-content {
    max-width: var(--header-max-width, 800px);
    margin: 0 auto;
    padding: var(--gap-fields) var(--layout-px-base);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .header-top-row {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .action-container {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
  }

  .action-container.left {
    left: 0;
  }

  .action-container.right {
    right: 0;
  }

  h1 {
    font-size: var(--text-2xl);
    font-weight: var(--font-weight-extrabold);
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xs);
  }

  .title-text {
    background: linear-gradient(
      135deg,
      var(--text-primary) 20%,
      var(--primary) 100%
    );
    font-size: var(--text-2xl);
    font-weight: 800;
    letter-spacing: 0.1em;
    color: var(--text-primary);
    text-transform: uppercase;
    text-shadow: 0 0 10px var(--primary-glow);
    background-clip: text;
    -webkit-background-clip: text;
  }

  .title-icon {
    height: 1.9rem;
    width: auto;
    margin-right: 0.1rem;
    filter: drop-shadow(0 2px 5px var(--primary-glow));
    transform: translateY(-0.05rem);
  }

  @media (max-width: 600px) {
    .header-content {
      padding: var(--gap-sm) var(--gap-fields);
    }
  }
</style>
