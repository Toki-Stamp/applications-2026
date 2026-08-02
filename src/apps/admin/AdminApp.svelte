<script>
  import ThemeSwitcher from "$shared/components/ui/ThemeSwitcher.svelte";
  import Header from "$shared/components/layout/Header.svelte";
  import { fade } from "svelte/transition";
  import Button from "$shared/components/ui/Button.svelte";
  import ExpenseForm from "./components/ExpenseForm.svelte";
  import ExpenseLedger from "./components/ExpenseLedger.svelte";
  import { adminStore } from "./store.svelte.js";
  import { onMount } from "svelte";

  // Tab state: 'add' or 'ledger'
  let activeTab = $state("add");

  /** @type {{ submit: Function } | null} */
  let formApi = $state(null);

  onMount(() => {
    // Kick off fetching participants for autocomplete
    adminStore.loadParticipants();
  });
</script>

<div class="app-transition-wrapper">
  <div class="app-form">
    <Header title="АКУПКИ">
      {#snippet leftAction()}
        <ThemeSwitcher />
      {/snippet}
    </Header>

    <div class="pro-body" in:fade={{ duration: 400, delay: 100 }}>
      <div
        class="pro-content {activeTab === 'ledger' ? 'is-wide' : 'is-narrow'}"
      >
        {#if activeTab === "add"}
          <div in:fade={{ duration: 250, delay: 100 }}>
            <ExpenseForm onready={(api) => { formApi = api; }} />
          </div>
        {:else}
          <div in:fade={{ duration: 250, delay: 100 }}>
            <ExpenseLedger />
          </div>
        {/if}
      </div>
    </div>

    <!-- Contextual Footer -->
    <footer class="layout-footer nav-footer">
      <div class="footer-content">
        {#if activeTab === "add"}
          <Button
            variant="outline"
            onclick={() => (activeTab = "ledger")}
            class="nav-button"
          >
            <md-icon>list_alt</md-icon>
            <span>Журнал</span>
          </Button>
          <Button
            variant="primary"
            onclick={() => formApi?.submit()}
            class="nav-button"
          >
            <md-icon>check_circle</md-icon>
            <span>Сохранить</span>
          </Button>
        {:else}
          <Button
            variant="primary"
            onclick={() => (activeTab = "add")}
            class="nav-button"
          >
            <md-icon>add_circle</md-icon>
            <span>Новый расход</span>
          </Button>
        {/if}
      </div>
    </footer>
  </div>
</div>

<style>
  .app-transition-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-height: 0;
    overflow-x: hidden;
  }
  .app-form {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    min-height: 0;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .pro-body {
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .pro-content {
    padding: var(--layout-py-base) var(--layout-px-base);
    margin: 0 auto;
    width: 100%;
    color: var(--text-primary);
    transition: max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Dynamic widths based on active tab */
  .pro-content.is-narrow {
    max-width: var(--form-max-width, 800px);
  }
  .pro-content.is-wide {
    max-width: var(--table-max-width, 1200px);
  }

  .nav-footer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .footer-content {
    display: flex;
    gap: var(--gap-section);
    justify-content: center;
    width: 100%;
    max-width: var(--form-max-width, 800px);
    margin: 0 auto;
    padding: var(--gap-sm) var(--gap-layout);
  }

  :global(.nav-button) {
    flex: 1;
    height: 48px !important;
    font-size: 1.1rem !important;
  }

  @media (max-width: 768px) {
    .pro-content {
      padding: var(--layout-py-sm) var(--layout-px-sm);
    }
    .footer-content {
      padding: var(--gap-xs) var(--layout-px-sm);
      gap: var(--gap-sm);
    }
  }
</style>
