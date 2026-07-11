<script>
  import ThemeSwitcher from "./ThemeSwitcher.svelte";
  import ProgressBar from "./ProgressBar.svelte";

  export let currentStep;
  export let totalSteps;
  export let headerHeight = 0;
</script>

<header class="app-header" bind:clientHeight={headerHeight}>
  <div class="header-content">
    <div class="header-top-row">
      <div class="title-container">
        <h1>Заявка 2026</h1>
      </div>
      <div class="theme-switcher-container">
        <ThemeSwitcher />
      </div>
    </div>

    {#if currentStep > 1}
      <ProgressBar {currentStep} {totalSteps} />
    {/if}
  </div>
</header>

<style>
  .app-header {
    position: sticky;
    top: 0;
    width: 100%;
    background: rgba(9, 9, 11, 0.7);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    z-index: 50;
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem 1.5rem 0.5rem;
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
    margin-bottom: 0.5rem;
  }

  .theme-switcher-container {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  h1 {
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(
      135deg,
      var(--text-primary) 20%,
      var(--primary) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 5px var(--primary-glow));
  }

  @media (max-width: 600px) {
    .header-content {
      padding: 0.5rem 1rem;
    }
  }
</style>
