<script>
  import "$apps/applications/components/grid.css";
  import Button from "$shared/components/ui/Button.svelte";
  import Modal from "$shared/components/ui/Modal.svelte";
  import { adminStore } from "../store.svelte.js";
  import { dict } from "$shared/locales/ru.js";

  const tLedger = dict.admin.ledger;
  const tCols = tLedger.cols;

  // Filter state
  let searchQuery = $state("");
  let headerHeight = $state(0);
  let isScrolledX = $state(false);
  let isScrolledY = $state(false);

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
  <div class="table-wrapper glass-panel">
    <div
      class="table-container"
      style="--header-height: {headerHeight}px"
      onscroll={(e) => {
        isScrolledX = e.currentTarget.scrollLeft > 0;
        isScrolledY = e.currentTarget.scrollTop > 0;
      }}
    >
      <table
        class="participants-table"
        class:is-scrolled-x={isScrolledX}
        class:is-scrolled-y={isScrolledY}
      >
        <thead bind:clientHeight={headerHeight}>
          <tr>
            <th class="sticky-num sticky-col">#</th>
            <th class="sticky-col col-name">{tCols.date}</th>
            <th>{tCols.category}</th>
            <th>{tCols.name}</th>
            <th>{tCols.payer}</th>
            <th class="text-right">{tCols.amount}</th>
            <th>{tCols.comment}</th>
            <th class="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          {#each filteredExpenses as exp, i (exp.id)}
            <tr>
              <td class="sticky-num sticky-col">{i + 1}</td>
              <td class="sticky-col col-name date-cell">{formatDate(exp.date)}</td>
              <td>
                <span class="category-badge">{exp.category}</span>
              </td>
              <td class="name-cell">{exp.name || "—"}</td>
              <td class="payer-cell">{exp.payer}</td>
              <td class="amount-cell text-right">{formatMoney(exp.amount)}</td>
              <td class="comment-cell">{exp.comment || "—"}</td>
              <td class="actions-col">
                <div class="action-buttons">
                  <Button
                    variant="clear"
                    class="action-btn text-error"
                    onclick={() => confirmDelete(exp)}
                  >
                    <md-icon>delete</md-icon>
                  </Button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="8" class="empty-state">
                <md-icon>receipt</md-icon>
                <p>{tLedger.emptyFilter}</p>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

{#if isDeleteModalOpen}
  <Modal
    title={tLedger.deleteModal.title}
    onclose={() => (isDeleteModalOpen = false)}
  >
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
      <Button variant="secondary" onclick={() => (isDeleteModalOpen = false)}>
        {dict.common.cancel}
      </Button>
      <Button variant="danger" onclick={handleDelete}>
        {tLedger.deleteModal.confirm}
      </Button>
    {/snippet}
  </Modal>
{/if}

<style>
  .ledger-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
  }

  .text-right {
    text-align: right;
  }

  .date-cell {
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .payer-cell {
    font-weight: 600;
  }

  .amount-cell {
    font-weight: 700;
    font-size: var(--text-base);
    color: var(--primary);
  }

  .category-badge {
    display: inline-block;
    padding: var(--gap-xs) var(--gap-sm);
    border-radius: var(--radius-sm);
    background: var(--bg-color-accent);
    color: var(--text-primary);
    font-size: var(--text-xs);
    font-weight: 600;
    border: 1px solid var(--glass-border);
  }

  .comment-cell {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .actions-col {
    width: 50px;
    text-align: center;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
  }

  :global(.action-btn) {
    width: 32px !important;
    height: 32px !important;
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
