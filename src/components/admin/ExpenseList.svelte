<script>
  import { adminStore } from "../../store.admin.svelte.js";

  // Хелпер для формата валюты
  const formatMoney = (val) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'BYN' }).format(val);
  
  // Цветовое кодирование
  const catColors = {
    food: 'var(--success, #10b981)',
    alcohol: 'var(--accent, #8b5cf6)',
    org: 'var(--primary, #06b6d4)'
  };
  const catLabels = {
    food: 'Питание',
    alcohol: 'Алкоголь',
    org: 'Оргнужды'
  };
</script>

<div class="expense-list">
  {#each adminStore.expenses as exp (exp.id)}
    <div class="expense-card">
      <div class="card-indicator" style="background-color: {catColors[exp.category]}; box-shadow: 0 0 12px {catColors[exp.category]};"></div>
      
      <div class="card-content">
        <div class="card-header">
          <span class="cat-label" style="color: {catColors[exp.category]}">{catLabels[exp.category]}</span>
          <button class="delete-btn" onclick={() => adminStore.removeExpense(exp.id)} title="Удалить">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="card-body">
          <h4 class="exp-name">{exp.name}</h4>
          <span class="exp-amount">{formatMoney(exp.amount)}</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="empty-state">Нет добавленных расходов</div>
  {/each}
</div>

<style>
  .expense-list {
    display: flex; flex-direction: column; gap: 12px;
    margin-top: 24px;
  }

  .expense-card {
    display: flex;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    backdrop-filter: blur(12px);
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .expense-card:hover {
    border-color: var(--glass-border-hover);
    transform: translateY(-2px);
  }

  .card-indicator {
    width: 4px;
    flex-shrink: 0;
  }

  .card-content {
    flex: 1; padding: 12px 16px; display: flex; flex-direction: column; gap: 4px;
  }

  .card-header {
    display: flex; justify-content: space-between; align-items: center;
  }

  .cat-label {
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  }

  .delete-btn {
    background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px;
    display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s;
  }
  .delete-btn svg { width: 16px; height: 16px; }
  .delete-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

  .card-body {
    display: flex; justify-content: space-between; align-items: flex-end;
  }

  .exp-name {
    margin: 0; font-size: var(--text-base, 16px); color: var(--text-primary); font-weight: 500;
  }

  .exp-amount {
    font-family: monospace; font-size: var(--text-lg, 18px); color: var(--text-primary); font-weight: 600;
  }

  .empty-state {
    text-align: center; color: var(--text-secondary); padding: 32px 0; font-size: 14px;
    background: rgba(0,0,0,0.2); border-radius: var(--radius-md); border: 1px dashed var(--glass-border);
  }
</style>
