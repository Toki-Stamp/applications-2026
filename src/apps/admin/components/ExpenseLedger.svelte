<script>
  import Block from "$shared/components/layout/Block.svelte";
  import Section from "$shared/components/layout/Section.svelte";
  import Button from "$shared/components/ui/Button.svelte";
  import Modal from "$shared/components/ui/Modal.svelte";
  import { adminStore } from "../store.svelte.js";
  import TextInput from "$shared/components/inputs/TextInput.svelte";
  import { dict } from "$shared/locales/ru.js";

  const tLedger = dict.admin.ledger;
  const tCols = tLedger.cols;

  // Filter state
  let searchQuery = $state("");

  // Derived filtered expenses
  let filteredExpenses = $derived.by(() => {
    let list = adminStore.expenses;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.payer.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.name && e.name.toLowerCase().includes(q)) ||
          (e.comment && e.comment.toLowerCase().includes(q))
      );
    }
    // Sort by date descending (newest first)
    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  // Derived summaries
  let totalAmount = $derived(
    filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  );

  let categoryTotals = $derived.by(() => {
    /** @type {Record<string, number>} */
    const totals = {};
    for (const e of filteredExpenses) {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    }
    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  });

  // Delete modal state
  let isDeleteModalOpen = $state(false);
  /** @type {any} */
  let expenseToDelete = $state(null);

  /** @param {any} expense */
  function confirmDelete(expense) {
    expenseToDelete = expense;
    isDeleteModalOpen = true;
  }

  function handleDelete() {
    if (expenseToDelete) {
      adminStore.deleteExpense(expenseToDelete.id);
    }
    isDeleteModalOpen = false;
    expenseToDelete = null;
  }

  // Formatting helpers
  /** @param {number} amount */
  function formatMoney(amount) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "BYN",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /** @param {string} isoString */
  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<div class="ledger-container">
  <!-- Search/Filter -->
  <Section>
    <div class="search-bar glass-panel">
      <TextInput
        placeholder={tLedger.searchPlaceholder}
        icon="search"
        bind:value={searchQuery}
      />
    </div>
  </Section>

  <!-- Summary Cards -->
  <Section>
    <div class="summary-cards">
      <div class="summary-card total glass-panel">
        <span class="card-label">{tLedger.totalLabel}</span>
        <span class="card-value">{formatMoney(totalAmount)}</span>
      </div>
      {#each categoryTotals as cat}
        <div class="summary-card glass-panel">
          <span class="card-label">{cat.name}</span>
          <span class="card-value">{formatMoney(cat.amount)}</span>
        </div>
      {/each}
    </div>
  </Section>

  <!-- Table -->
  <Block title={tLedger.tableTitle} icon="list_alt">
    <div class="table-wrapper">
      <table class="ledger-table">
        <thead>
          <tr>
            <th>{tCols.date}</th>
            <th>{tCols.category}</th>
            <th>{tCols.name}</th>
            <th>{tCols.payer}</th>
            <th class="text-right">{tCols.amount}</th>
            <th>{tCols.comment}</th>
            <th class="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          {#each filteredExpenses as exp (exp.id)}
            <tr>
              <td class="date-cell">{formatDate(exp.date)}</td>
              <td>
                <span class="category-badge">{exp.category}</span>
              </td>
              <td class="name-cell">{exp.name || "—"}</td>
              <td class="payer-cell">{exp.payer}</td>
              <td class="amount-cell text-right">{formatMoney(exp.amount)}</td>
              <td class="comment-cell">{exp.comment || "—"}</td>
              <td class="actions-col">
                <div class="action-buttons">
                  <Button variant="clear" class="action-btn text-error" onclick={() => confirmDelete(exp)}>
                    <md-icon>delete</md-icon>
                  </Button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="empty-state">
                <md-icon>receipt</md-icon>
                <p>{tLedger.emptyFilter}</p>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Block>
</div>

{#if isDeleteModalOpen}
<Modal title={tLedger.deleteModal.title} onclose={() => (isDeleteModalOpen = false)}>
  <div class="modal-body">
    <p>{tLedger.deleteModal.body}</p>
    {#if expenseToDelete}
      <div class="delete-details">
        <strong>{expenseToDelete.payer}</strong> — {expenseToDelete.category}
        <br />
        <span class="delete-amount">{formatMoney(expenseToDelete.amount)}</span>
      </div>
    {/if}
  </div>
  {#snippet actions()}
    <Button variant="secondary" onclick={() => (isDeleteModalOpen = false)}>{dict.common.cancel}</Button>
    <Button variant="danger" onclick={handleDelete}>{tLedger.deleteModal.confirm}</Button>
  {/snippet}
</Modal>
{/if}

<style>
  .ledger-container {
    display: flex;
    flex-direction: column;
    gap: var(--gap-section);
  }

  .search-bar {
    padding: var(--gap-sm);
    border-radius: var(--border-radius);
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--gap-layout);
  }

  .summary-card {
    display: flex;
    flex-direction: column;
    padding: var(--layout-py-base) var(--layout-px-base);
    border-radius: var(--border-radius);
    text-align: center;
    gap: var(--gap-sm);
  }

  .summary-card.total {
    background: color-mix(in srgb, var(--primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--primary) 30%, transparent);
  }

  .summary-card.total .card-value {
    color: var(--primary);
    font-size: var(--text-2xl);
  }

  .card-label {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card-value {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--text-primary);
  }

  /* Table Styles */
  .table-wrapper {
    overflow-x: auto;
    margin: 0 calc(var(--layout-px-base) * -1); /* Full width on mobile */
    padding: 0 var(--layout-px-base);
  }

  .ledger-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    min-width: 600px;
  }

  th {
    text-align: left;
    padding: var(--gap-sm);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: 600;
    text-transform: uppercase;
    border-bottom: 1px solid var(--border-color);
  }

  td {
    padding: var(--gap-sm);
    border-bottom: 1px solid var(--glass-border);
    color: var(--text-primary);
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: var(--bg-color-hover);
  }

  .text-right {
    text-align: right;
  }

  .date-cell {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    white-space: nowrap;
  }

  .payer-cell {
    font-weight: 600;
  }

  .amount-cell {
    font-weight: 700;
    font-size: var(--text-lg);
    white-space: nowrap;
  }

  .category-badge {
    display: inline-block;
    padding: var(--gap-xs) var(--gap-sm);
    border-radius: var(--radius-sm);
    background: var(--bg-color-accent);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .comment-cell {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions-col {
    width: 60px;
    text-align: right;
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
  }

  :global(.action-btn) {
    width: 36px !important;
    height: 36px !important;
    padding: 0 !important;
    border-radius: var(--radius-full) !important;
  }

  .empty-state {
    text-align: center;
    padding: var(--layout-py-base) !important;
    color: var(--text-secondary);
  }

  .empty-state md-icon {
    font-size: var(--text-3xl);
    margin-bottom: var(--gap-fields);
    opacity: 0.5;
  }

  /* Modal */
  .modal-body {
    padding: var(--gap-layout) 0;
    text-align: center;
  }

  .delete-details {
    margin-top: var(--gap-section);
    padding: var(--gap-layout);
    background: var(--bg-color-accent);
    border-radius: var(--border-radius);
  }

  .delete-amount {
    display: block;
    margin-top: var(--gap-sm);
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--error-color, #ef4444);
  }
</style>
