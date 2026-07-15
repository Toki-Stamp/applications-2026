<script>
  import ThemeSwitcher from "../ui/ThemeSwitcher.svelte";
  import ProgressBar from "../ui/ProgressBar.svelte";

  let { currentStep, totalSteps, headerHeight = $bindable(0) } = $props();
</script>

<header class="app-header" bind:clientHeight={headerHeight}>
  <div class="header-content">
    <div class="header-top-row">
      <div class="theme-switcher-container">
        <ThemeSwitcher />
      </div>
      <div class="title-container">
        <h1>
          <img src="/favicon.svg" alt="Z" class="title-icon" />
          <span class="title-text">аявка 2026</span>
        </h1>
      </div>
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
    z-index: 50;
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
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
    z-index: 20;
  }

  .theme-switcher-container {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  h1 {
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.1rem;
  }

  .title-text {
    background: linear-gradient(
      135deg,
      var(--text-primary) 20%,
      var(--primary) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 5px var(--primary-glow));
    text-transform: uppercase;
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
      padding: 0.5rem 1rem;
    }
  }
</style>
