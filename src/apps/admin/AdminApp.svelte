<script>

  import { adminStore } from "$apps/admin/store.admin.svelte.js";
  import ThemeSwitcher from "$shared/components/ui/ThemeSwitcher.svelte";
  import Header from "$shared/components/layout/Header.svelte";
  import Slider from "$shared/components/inputs/Slider.svelte";
  import ExpenseForm from "./components/ExpenseForm.svelte";
  import ExpenseList from "./components/ExpenseList.svelte";
  import CategorySelector from "$shared/components/inputs/CategorySelector.svelte";
  import { fade } from "svelte/transition";

  let authorized = $state(true);
</script>

<div class="app-transition-wrapper">
  <div class="app-form">
    <Header title="Admin Dashboard">
      {#snippet leftAction()}
        <ThemeSwitcher />
      {/snippet}
    </Header>

    <div class="pro-body" in:fade={{ duration: 400, delay: 100 }}>
      
      <!-- Секция Управления Расходами (Expense Ledger) -->
      <section class="config-section">
        <h2 class="section-title">Expense Ledger</h2>
        <p class="section-desc">Добавление и редактирование текущих расходов. Изменения мгновенно отражаются в общих пулах.</p>

        <div class="expense-ledger-container">
          <!-- Форма ввода нового расхода -->
          <ExpenseForm />
          
          <!-- Лента добавленных расходов -->
          <ExpenseList />
        </div>
      </section>

      <section class="config-section">
        <h2 class="section-title">Risk Management</h2>
        <div class="panel">
          <div class="panel-row">
            <div class="panel-row-info">
              <h3>Базовый риск на сделку</h3>
            </div>
            <div class="panel-row-control slider-control-wrap">
              <Slider bind:value={adminStore.riskMargin} min={0} max={100} showLabels={false} />
            </div>
          </div>
        </div>
      </section>
      
    </div>
  </div>
</div>

<style>
  .app-transition-wrapper { display: flex; flex-direction: column; width: 100%; flex: 1; min-height: 0; overflow-x: hidden; }
  .app-form { display: flex; flex-direction: column; flex: 1; width: 100%; min-height: 0; max-width: 100vw; overflow-x: hidden; }

  .pro-body {
    flex: 1; min-height: 0; width: 100%; 
    padding: var(--layout-py-base) var(--layout-px-base); 
    max-width: var(--form-max-width, 800px);
    margin: 0 auto;
    overflow-y: auto; overflow-x: hidden; color: var(--text-primary);
  }
  @media (max-width: 768px) { .pro-body { padding: var(--layout-py-sm) var(--layout-px-sm); } }

  .config-section { margin-top: 2rem; margin-bottom: 3rem; }
  .opacity-50 { opacity: 0.5; }
  
  .section-title { font-size: var(--text-2xl, 24px); font-weight: var(--font-weight-bold, 700); margin-bottom: 8px; color: var(--text-primary); font-family: var(--font-family); }
  .section-desc { color: var(--text-secondary); font-size: var(--text-base, 16px); margin-bottom: 24px; font-family: var(--font-family); line-height: 1.6; }

  .panel { background: var(--glass-bg); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 0; overflow: hidden; box-shadow: var(--shadow-md); }

  .panel-row { display: flex; flex-direction: column; padding: 24px; border-bottom: 1px solid var(--glass-border); gap: 16px; }
  @media (min-width: 768px) {
    .panel-row { flex-direction: row; justify-content: space-between; align-items: center; padding: 32px 24px; gap: 0; }
  }
  .panel-row:last-child { border-bottom: none; }

  .panel-row-info { flex: 1; padding-right: 32px; }
  .panel-row-info h3 { font-size: var(--text-lg, 18px); font-weight: var(--font-weight-semibold, 600); margin-bottom: 8px; font-family: var(--font-family); color: var(--primary); }
  .panel-row-info p { font-size: var(--text-sm, 14px); color: var(--text-secondary); line-height: 1.5; font-family: var(--font-family); }

  .panel-row-control { flex-shrink: 0; display: flex; align-items: center; justify-content: flex-end; width: 100%; }
  @media (min-width: 768px) { .panel-row-control { width: auto; } }
  
  .slider-control-wrap { width: 360px; padding-top: 16px; }
  .expense-ledger-container { display: flex; flex-direction: column; gap: 0; }
</style>
