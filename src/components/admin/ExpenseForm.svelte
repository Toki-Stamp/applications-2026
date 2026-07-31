<script>
  import CategorySelector from "../ui/CategorySelector.svelte";
  import { adminStore } from "../../store.admin.svelte.js";
  import { dict } from "../../locales/ru.js";

  const categoryOptions = [
    { id: 'food', label: dict.options.expenseCategories.food, icon: 'restaurant' },
    { id: 'alcohol', label: dict.options.expenseCategories.alcohol, icon: 'wine_bar' },
    { id: 'org', label: dict.options.expenseCategories.org, icon: 'business_center' }
  ];

  let category = $state('food');
  let name = $state('');
  let amount = $state('');
  let importance = $state(50);

  function handleAdd() {
    if (!name.trim() || !amount || isNaN(amount) || amount <= 0) return;
    adminStore.addExpense(category, name.trim(), Number(amount));
    name = '';
    amount = '';
  }
</script>

<div class="expense-form panel">
  
  <div class="form-header">
    <h3>Новый расход</h3>
  </div>

  <div class="form-row">
    <CategorySelector options={categoryOptions} bind:selectedId={category} />
  </div>
  
  <!-- Слайдеры убраны, так как они не имеют логического смысла для добавления конкретного расхода -->
  
  <div class="form-row inputs-row">
    <div class="input-group flex-2">
      <input type="text" placeholder="Название расхода (напр. Мясо)" bind:value={name} class="cyber-input" />
    </div>
    
    <div class="input-group flex-1">
      <input type="number" placeholder="BYN" bind:value={amount} min="0" step="0.01" class="cyber-input amount-input" />
    </div>
    
    <button class="add-btn" onclick={handleAdd} disabled={!name.trim() || !amount || amount <= 0}>
      Добавить
    </button>
  </div>
</div>

<style>
  .expense-form {
    padding: var(--layout-py-base, 24px) var(--layout-px-base, 24px);
    display: flex; flex-direction: column; gap: 20px;
    background: var(--glass-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  .form-header h3 {
    font-size: var(--text-lg, 18px);
    font-weight: var(--font-weight-bold, 700);
    font-family: var(--font-family);
    color: var(--text-primary);
    margin: 0;
  }

  .inputs-row {
    display: flex; gap: 12px; flex-wrap: wrap;
  }
  
  .flex-2 { flex: 2; min-width: 200px; }
  .flex-1 { flex: 1; min-width: 100px; }

  .cyber-input {
    width: 100%;
    background: rgba(0,0,0,0.2);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    color: var(--text-primary);
    font-family: var(--font-family);
    font-size: var(--text-base);
    transition: all 0.3s ease;
  }

  .cyber-input::placeholder {
    color: var(--text-secondary);
  }

  .cyber-input:focus {
    background: rgba(0,0,0,0.4);
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 1px var(--primary), 0 0 12px var(--primary-glow);
  }

  .amount-input {
    font-family: monospace;
    font-size: 16px;
  }

  .add-btn {
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    color: var(--primary);
    border: 1px solid color-mix(in srgb, var(--primary) 50%, transparent);
    border-radius: var(--radius-md);
    padding: 0 24px;
    font-weight: var(--font-weight-semibold, 600);
    font-family: var(--font-family);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all 0.3s ease;
    height: 46px; /* Match input height */
    align-self: flex-end;
  }

  .add-btn:hover:not(:disabled) {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 0 16px var(--primary-glow);
  }

  .add-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
