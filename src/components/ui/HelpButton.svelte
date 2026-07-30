<script>
  import Tooltip from "./Tooltip.svelte";
  import Popover from "./Popover.svelte";
  
  let { children } = $props();
  let showHelp = $state(false);
  let anchorNode = $state();
</script>

<div class="help-container">
  <div class="help-button-wrapper" bind:this={anchorNode}>
    <Tooltip text="Справка" pos="bottom-right" variant="neon" enabled={!showHelp}>
      <button
        type="button"
        class="icon-btn"
        onclick={() => (showHelp = !showHelp)}
        class:active={showHelp}
        aria-label="Справка"
      >
        <md-icon>live_help</md-icon>
      </button>
    </Tooltip>
  </div>

  <Popover isOpen={showHelp} onclose={() => showHelp = false} backdrop={true} width="min(var(--popover-width-lg), calc(100vw - calc(var(--gap-fields) * 2)))" referenceNode={anchorNode}>
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
    width: var(--icon-btn-size);
    height: var(--icon-btn-size);
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


</style>
