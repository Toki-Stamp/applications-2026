<script>
  import Tooltip from "./Tooltip.svelte";
  import Popover from "./Popover.svelte";
  
  let { children } = $props();
  let showHelp = $state(false);
  let containerWidth = $state(0);
</script>

<div class="help-container" bind:clientWidth={containerWidth}>
  <Tooltip text="Справка" pos="bottom-right" variant="neon" enabled={!showHelp}>
    <button
      class="icon-btn"
      onclick={() => (showHelp = !showHelp)}
      class:active={showHelp}
      aria-label="Справка"
    >
      <md-icon>live_help</md-icon>
    </button>
  </Tooltip>

  <!-- We use CSS custom property for responsive width -->
  <Popover isOpen={showHelp} onclose={() => showHelp = false} backdrop={true} width="var(--popover-width, calc(var(--header-content-width, 800px) * 0.5))">
    <div class="help-content">
      {#if children}{@render children()}{/if}
    </div>
  </Popover>
</div>

<style>
  .help-container {
    position: relative;
    display: inline-flex;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: var(--text-2xl);
    --md-icon-size: var(--text-2xl);
    cursor: pointer;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
  }

  .icon-btn:hover,
  .icon-btn.active {
    color: var(--primary);
  }

  @keyframes wiggle {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-15deg); }
    50% { transform: rotate(10deg); }
    75% { transform: rotate(-5deg); }
    100% { transform: rotate(0deg); }
  }

  .icon-btn md-icon {
    font-size: var(--text-2xl);
    transform-origin: center bottom;
    font-weight: 600;
    font-variation-settings: "wght" 500;
  }

  .icon-btn:hover md-icon,
  .icon-btn.active md-icon {
    animation: wiggle 0.5s ease-in-out;
  }

  @media (max-width: 600px) {
    .help-container {
      --popover-width: calc(100vw - var(--gap-fields) * 2);
    }
  }
</style>
