<script>
  import { onMount } from "svelte";
  import { GOOGLE_SCRIPT_URL } from "./constants.js";
  import { dict } from "./locales/ru.js";
  import Overlay from "./components/ui/Overlay.svelte";
  import Header from "./components/layout/Header.svelte";
  import DashboardGrid from "./components/dashboard/DashboardGrid.svelte";
  
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
      
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch")) {
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
    <Header />
    
    <div class="app-body dashboard-body">
      {#if isLoading}
        <Overlay variant="loading" absolute={true} zIndex={100}>
          <md-icon class="flipping large-icon text-primary">hourglass_empty</md-icon>
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
          <DashboardGrid {participants} />
        </div>
      {/if}
    </div>
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
    --header-max-width: 1200px;
  }

  .dashboard-body {
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: var(--gap-layout) calc(var(--gap-layout) - var(--scrollbar-width)) var(--gap-layout) var(--gap-layout);
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 600px) {
    .dashboard-body {
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
    color: var(--text-secondary, color-mix(in srgb, var(--text-primary) 70%, transparent));
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
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
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
