<script>
  import ThemeSwitcher from "../ui/ThemeSwitcher.svelte";
  import ProgressBar from "../ui/ProgressBar.svelte";
  import Tooltip from "../ui/Tooltip.svelte";
  import { dict } from "../../locales/ru.js";
  import { scale } from "svelte/transition";

  let {
    currentStep = 0,
    totalSteps = 0,
    headerHeight = $bindable(0),
    helpPanel = null,
  } = $props();

  let showHelp = $state(false);
  let headerWidth = $state(0);
</script>

<header class="app-header" bind:clientHeight={headerHeight}>
  {#if showHelp}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="help-backdrop" onclick={() => (showHelp = false)}></div>
  {/if}

  <div class="header-content" bind:clientWidth={headerWidth}>
    <div class="header-top-row">
      <div class="theme-switcher-container">
        <ThemeSwitcher />
      </div>
      <div class="title-container">
        <h1>
          <img src="/favicon.svg" alt="Z" class="title-icon" />
          <span class="title-text">{dict.layout.header.titleText}</span>
        </h1>
      </div>

      {#if helpPanel}
        <div class="help-container">
          <Tooltip
            text="Справка"
            pos="bottom-right"
            variant="neon"
            enabled={!showHelp}
          >
            <button
              class="icon-btn"
              onclick={() => (showHelp = !showHelp)}
              class:active={showHelp}
              aria-label="Справка"
            >
              <md-icon>live_help</md-icon>
            </button>
          </Tooltip>

          {#if showHelp}
            <div
              class="help-popover"
              style="width: {headerWidth > 600
                ? headerWidth * 0.5 + 'px'
                : ''};"
              transition:scale={{ start: 0.95, duration: 200 }}
            >
              {@render helpPanel()}
            </div>
          {/if}
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
    z-index: 50;
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

  .theme-switcher-container {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
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

  .help-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 90;
    background: transparent;
    cursor: default;
  }

  .help-container {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
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
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-15deg);
    }
    50% {
      transform: rotate(10deg);
    }
    75% {
      transform: rotate(-5deg);
    }
    100% {
      transform: rotate(0deg);
    }
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

  .help-popover {
    position: absolute;
    top: calc(100% + 10px); /* Exactly matching custom-tooltip top */
    right: 0; /* Exactly matching custom-tooltip right */
    z-index: 100;
    text-align: left;
    transform-origin: top right;
  }

  .help-popover :global(.block-card) {
    background: var(--bg-color-accent) !important;
    border: 1px solid var(--glass-border-hover) !important;
    box-shadow:
      0 10px 40px -10px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(139, 92, 246, 0.2) !important;
  }

  .help-popover :global(.block-card)::before {
    opacity: 1 !important;
    background: linear-gradient(
      135deg,
      var(--primary) 0%,
      rgba(255, 255, 255, 0) 50%,
      var(--accent) 100%
    ) !important;
  }

  .help-popover :global(.block-content) {
    padding: var(--gap-fields) !important;
  }

  .help-popover :global(.block-title) {
    padding-left: var(--gap-fields) !important;
    padding-right: var(--gap-fields) !important;
  }

  @media (max-width: 600px) {
    .header-content {
      padding: var(--gap-sm) var(--gap-fields);
    }

    .help-popover {
      width: calc(100vw - var(--gap-fields) * 2);
    }
  }
</style>
