<script>
  import { adminStore } from "../../store.admin.svelte.js";
  import ThemeSwitcher from "../ui/ThemeSwitcher.svelte";
  import Header from "../layout/Header.svelte";
  import GhostSlider from "../ui/GhostSlider.svelte";
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
      
      <section class="config-section">
        <h2 class="section-title">Risk Management</h2>
        <p class="section-desc">Настройка ключевых параметров торговых алгоритмов и допустимых отклонений.</p>

        <div class="panel">
          
          <div class="panel-row">
            <div class="panel-row-info">
              <h3>Базовый риск на сделку</h3>
              <p>Определяет максимальный процент капитала, который может быть подвержен риску в рамках одной операции.</p>
            </div>
            
            <div class="panel-row-control slider-control-wrap">
              <GhostSlider bind:value={adminStore.riskMargin} min={0} max={100} showLabels={false} />
            </div>
          </div>
          
          <div class="panel-row">
            <div class="panel-row-info">
              <h3>Коэффициент плеча</h3>
              <p>Глобальный ограничитель кредитного плеча для маржинальных аккаунтов.</p>
            </div>
            <div class="panel-row-control">
              <button class="mock-btn">Standard (1:5)</button>
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

  .config-section {
    margin-top: 2rem;
    margin-bottom: 3rem;
  }
  
  .section-title {
    font-size: var(--text-2xl, 24px);
    font-weight: var(--font-weight-bold, 700);
    margin-bottom: 8px;
    color: var(--text-primary);
    font-family: var(--font-family);
  }

  .section-desc {
    color: var(--text-secondary);
    font-size: var(--text-base, 16px);
    margin-bottom: 24px;
    font-family: var(--font-family);
    line-height: 1.6;
  }

  .panel {
    background: var(--glass-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius);
    padding: 0;
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .panel-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px 24px;
    border-bottom: 1px solid var(--glass-border);
  }
  .panel-row:last-child {
    border-bottom: none;
  }

  .panel-row-info {
    flex: 1;
    padding-right: 32px;
  }

  .panel-row-info h3 {
    font-size: var(--text-lg, 18px);
    font-weight: var(--font-weight-semibold, 600);
    margin-bottom: 8px;
    font-family: var(--font-family);
    color: var(--primary);
  }

  .panel-row-info p {
    font-size: var(--text-sm, 14px);
    color: var(--text-secondary);
    line-height: 1.5;
    font-family: var(--font-family);
  }

  .panel-row-control {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  
  .slider-control-wrap {
    width: 360px;
    padding-top: 16px;
  }

  .mock-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    font-family: var(--font-family);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .mock-btn:hover {
    background: rgba(255,255,255,0.1);
  }
</style>
