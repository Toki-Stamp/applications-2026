<script>
  import { onMount } from "svelte";
  import { GOOGLE_SCRIPT_URL } from "./constants.js";
  import { dict } from "./locales/ru.js";
  import Overlay from "./components/ui/Overlay.svelte";
  import Header from "./components/layout/Header.svelte";
  import ApplicationsGrid from "./components/applications/ApplicationsGrid.svelte";
  import HintBox from "./components/ui/HintBox.svelte";
  import Block from "./components/layout/Block.svelte";
  import RichText from "./components/ui/RichText.svelte";

  let isLoading = $state(true);
  /** @type {{title: string, body: string} | null} */
  let error = $state(null);

  /** @type {any[]} */
  let participants = $state([]);

  onMount(async () => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      participants = data.participants || [];
    } catch (e) {
      const msg = /** @type {Error} */ (e).message;
      let title = dict.modals.submitError.types.unknown.title;
      let body = dict.modals.submitError.types.unknown.bodyPrefix + msg;

      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("fetch")
      ) {
        title = dict.modals.submitError.types.network.title;
        body = dict.modals.submitError.types.network.body;
      } else if (msg === "Failed to fetch data") {
        title = dict.modals.submitError.types.server.title;
        body = dict.modals.submitError.types.server.body;
      } else if (!GOOGLE_SCRIPT_URL) {
        title = dict.modals.submitError.types.setup.title;
        body = dict.modals.submitError.types.setup.body;
      }

      error = { title, body };
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="app-transition-wrapper">
  <div class="app-form">
    <Header {helpPanel} />

    {#snippet helpPanel()}
      <Block title="Справка" icon="live_help">
        <div class="hints-container">
          <HintBox>
            <!-- prettier-ignore -->
            <span>{dict.options.globalHints.filterPrefix}<md-icon class="inline-icon">directions_car</md-icon>|<md-icon class="inline-icon">hail</md-icon>|<md-icon class="inline-icon">directions_bus</md-icon>|<md-icon class="inline-icon">directions_walk</md-icon>{dict.options.globalHints.filterSuffix}</span>
          </HintBox>
          <HintBox>
            <RichText content={dict.options.globalHints.select} />
          </HintBox>
          <div class="desktop-only">
            <HintBox>
              {dict.options.globalHints.multiSelectPrefix}<kbd>Ctrl</kbd> /
              <kbd>Cmd</kbd>{dict.options.globalHints.multiSelectSuffix}
            </HintBox>
          </div>
          <div class="desktop-only">
            <HintBox>
              {dict.options.globalHints.rangeSelectPrefix}<kbd class="accent-key">Shift</kbd>{dict
                .options.globalHints.rangeSelectSuffix}
            </HintBox>
          </div>
        </div>
      </Block>
    {/snippet}

    <div class="app-body applications-body">
      {#if isLoading}
        <Overlay variant="loading" absolute={true} zIndex={100}>
          <md-icon class="flipping large-icon text-primary"
            >hourglass_empty</md-icon
          >
          <p class="loading-text">{dict.common.loadingList}</p>
        </Overlay>
      {:else if error}
        <div class="error-state">
          <md-icon class="large-icon text-error">error</md-icon>
          <h3>{error.title}</h3>
          <p class="error-body">{error.body}</p>
        </div>
      {:else}
        <div class="content-wrapper">
          <ApplicationsGrid {participants} />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .hints-container {
    display: flex;
    flex-direction: column;
    gap: var(--gap-fields);
  }

  @media (max-width: 600px) {
    .desktop-only {
      display: none !important;
    }
  }

  kbd {
    background: color-mix(in srgb, var(--primary) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
    border-bottom: 2px solid color-mix(in srgb, var(--primary) 60%, transparent);
    border-radius: 4px;
    padding: 0.15rem 0.4rem;
    font-size: 0.75rem;
    font-family: var(--font-family);
    font-weight: 700;
    color: var(--primary);
    box-shadow: 0 2px 4px color-mix(in srgb, var(--primary) 20%, transparent);
    vertical-align: middle;
    position: relative;
    top: -1px;
    margin: 0 0.1em;
  }

  kbd.accent-key {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-bottom: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
    color: var(--accent);
    box-shadow: 0 2px 4px color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .inline-icon {
    vertical-align: middle;
    color: var(--primary);
    font-size: 1.4em;
    margin: 0 2px;
    position: relative;
    top: -2px;
  }

  .app-transition-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-height: 0;
  }

  .app-form {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    min-height: 0;
    --header-max-width: 1200px;
  }

  .applications-body {
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: var(--gap-layout) calc(var(--gap-layout) - var(--scrollbar-width))
      var(--gap-layout) var(--gap-layout);
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 600px) {
    .applications-body {
      padding: var(--layout-py-sm) var(--layout-px-sm);
    }
  }

  .content-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.5rem;
  }

  .error-state h3 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
  }

  .error-state .error-body {
    max-width: 400px;
    text-align: center;
    color: var(
      --text-secondary,
      color-mix(in srgb, var(--text-primary) 70%, transparent)
    );
    line-height: 1.5;
  }

  .error-state md-icon {
    font-size: 4rem;
    color: var(--danger-color, #ef4444);
    margin-bottom: 1rem;
  }

  .large-icon {
    --md-icon-size: 64px;
    width: 64px;
    height: 64px;
    font-size: 64px;
    margin-bottom: 1rem;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  }

  .loading-text {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--text-primary);
    margin: 0;
    text-align: center;
  }
</style>
