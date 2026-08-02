<script>
  import { onMount } from "svelte";
  import { GOOGLE_SCRIPT_URL } from "$shared/constants.js";
  import { dict } from "$shared/locales/ru.js";
  import { parseApiError } from "$shared/utils/errors.js";
  import Overlay from "$shared/components/ui/Overlay.svelte";
  import Header from "$shared/components/layout/Header.svelte";
  import Tooltip from "$shared/components/ui/Tooltip.svelte";
  import Button from "$shared/components/ui/Button.svelte";
  import { slide } from "svelte/transition";
  import ThemeSwitcher from "$shared/components/ui/ThemeSwitcher.svelte";
  import HelpButton from "$shared/components/ui/HelpButton.svelte";
  import ApplicationsHelp from "./components/ApplicationsHelp.svelte";
  import ApplicationsGrid from "./components/ApplicationsGrid.svelte";
  import ApplicationsFooter from "./components/ApplicationsFooter.svelte";
  import HourglassLoader from "$shared/components/ui/HourglassLoader.svelte";

  let isLoading = $state(true);
  /** @type {{title: string, body: string} | null} */
  let error = $state(null);

  /** @type {any[]} */
  let participants = $state([]);

  /** @type {Record<string, { value: string, details?: { catText: string, catIcon?: string, hideCatText?: boolean, valText: string, valIcon?: string, hideValText?: boolean } | null }>} */
  let activeFilters = $state({});
  let intersectionCount = $state(0);
  let filterMode = $state(false);

  $effect(() => {
    if (Object.keys(activeFilters).length === 0) {
      filterMode = false;
    }
  });

  onMount(async () => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      participants = data.participants || [];
    } catch (e) {
      console.error("Error fetching applications:", e);
      error = parseApiError(e);
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="app-transition-wrapper">
  <div class="app-form">
    <Header title="АЯВКИ">
      {#snippet leftAction()}
        <ThemeSwitcher />
      {/snippet}
      {#snippet rightAction()}
        <HelpButton>
          <ApplicationsHelp />
        </HelpButton>
      {/snippet}
    </Header>

    <div class="app-body applications-body">
      {#if isLoading}
        <Overlay variant="loading" absolute={true} zIndex={100}>
          <HourglassLoader size="64px" class="text-primary large-icon" />
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
          <ApplicationsGrid
            {participants}
            bind:activeFilters
            bind:intersectionCount
            {filterMode}
          />
        </div>
      {/if}
    </div>

    <ApplicationsFooter
      bind:activeFilters
      bind:filterMode
      {intersectionCount}
    />
  </div>
</div>

<style>
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
    --header-max-width: var(--table-max-width);
  }

  .applications-body {
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: var(--gap-layout);
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
    max-width: var(--table-max-width);
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

  .loading-text {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--text-primary);
    margin: 0;
    text-align: center;
  }
</style>
