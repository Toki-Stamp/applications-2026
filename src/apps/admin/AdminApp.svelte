<script>
  import ThemeSwitcher from "$shared/components/ui/ThemeSwitcher.svelte";
  import Header from "$shared/components/layout/Header.svelte";
  import { fade } from "svelte/transition";
</script>

<div class="app-transition-wrapper">
  <div class="app-form">
    <Header title="АКУПКИ 2026">
      {#snippet leftAction()}
        <ThemeSwitcher />
      {/snippet}
    </Header>

    <div class="pro-body" in:fade={{ duration: 400, delay: 100 }}>
      <!-- Clean slate for the new admin form -->
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
    padding: var(--layout-py-base) var(--layout-px-base);
    max-width: var(--form-max-width, 800px);
    margin: 0 auto;
    overflow-y: auto;
    overflow-x: hidden;
    color: var(--text-primary);
  }
  @media (max-width: 768px) {
    .pro-body {
      padding: var(--layout-py-sm) var(--layout-px-sm);
    }
  }
</style>
