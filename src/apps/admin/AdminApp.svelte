<script>
  import ThemeSwitcher from "$shared/components/ui/ThemeSwitcher.svelte";
  import Header from "$shared/components/layout/Header.svelte";
  import Tooltip from "$shared/components/ui/Tooltip.svelte";
  import Modal from "$shared/components/ui/Modal.svelte";
  import { fade } from "svelte/transition";
  import Button from "$shared/components/ui/Button.svelte";
  import ExpenseForm from "./components/ExpenseForm.svelte";
  import ExpenseLedger from "./components/ExpenseLedger.svelte";
  import { adminStore } from "./store.svelte.js";
  import { dict } from "$shared/locales/ru.js";
  import { EXPENSE_DRAFT_STORAGE_KEY } from "$shared/constants.js";
  import { onMount } from "svelte";

  const tNav = dict.admin.nav;

  // Tab state: 'add' or 'ledger'
  let activeTab = $state("ledger");

  /** @type {{ submit: Function } | null} */
  let formApi = $state(null);
  let formHasErrors = $state(false);
  let showDraftModal = $state(false);
  let showLeaveConfirmModal = $state(false);

  onMount(() => {
    // Kick off fetching participants for autocomplete
    adminStore.loadParticipants();

    // Check if there is an uncompleted expense draft in localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(EXPENSE_DRAFT_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const hasData =
            !!parsed.category ||
            !!parsed.name?.trim() ||
            !!parsed.amount ||
            !!parsed.payer?.trim() ||
            !!parsed.comment?.trim();
          if (hasData) {
            showDraftModal = true;
          }
        } catch (e) {
          localStorage.removeItem(EXPENSE_DRAFT_STORAGE_KEY);
        }
      }
    }
  });

  function handleRestoreDraft() {
    showDraftModal = false;
    activeTab = "add";
  }

  function handleDiscardDraft() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(EXPENSE_DRAFT_STORAGE_KEY);
    }
    showDraftModal = false;
  }

  function handleBackClick() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(EXPENSE_DRAFT_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const hasData =
            !!parsed.category ||
            !!parsed.name?.trim() ||
            !!parsed.amount ||
            !!parsed.payer?.trim() ||
            !!parsed.comment?.trim();
          if (hasData) {
            showLeaveConfirmModal = true;
            return;
          }
        } catch (e) {
          localStorage.removeItem(EXPENSE_DRAFT_STORAGE_KEY);
        }
      }
    }
    activeTab = "ledger";
  }

  function handleSaveDraftAndLeave() {
    showLeaveConfirmModal = false;
    activeTab = "ledger";
  }

  function handleDiscardDraftAndLeave() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(EXPENSE_DRAFT_STORAGE_KEY);
    }
    showLeaveConfirmModal = false;
    activeTab = "ledger";
  }
</script>

<div class="app-transition-wrapper">
  <div class="app-form">
    <Header title={dict.admin.headerTitle}>
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
            <ExpenseForm
              onready={(/** @type {any} */ api) => {
                formApi = api;
              }}
              onsuccess={() => {
                activeTab = "ledger";
              }}
              bind:hasErrors={formHasErrors}
            />
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
      <div
        class="footer-content {activeTab === 'ledger'
          ? 'is-wide'
          : 'is-narrow'}"
      >
        <div class="navigation-buttons">
          {#if activeTab === "add"}
            <div class="left-buttons"></div>
            <div class="right-buttons">
              <Tooltip text={tNav.formTooltip} pos="top-end">
                <Button
                  type="button"
                  variant="secondary"
                  iconOnly={true}
                  onclick={handleBackClick}
                >
                  <md-icon>arrow_back</md-icon>
                </Button>
              </Tooltip>
              <Tooltip
                text={formHasErrors
                  ? tNav.fillRequiredFields
                  : tNav.saveTooltip}
                pos="top-end"
              >
                <Button
                  type="button"
                  variant={formHasErrors ? "secondary" : "submit"}
                  locked={formHasErrors}
                  iconOnly={true}
                  onclick={() => formApi?.submit()}
                >
                  <md-icon>{formHasErrors ? "lock" : "check"}</md-icon>
                </Button>
              </Tooltip>
            </div>
          {:else}
            <div class="left-buttons"></div>
            <div class="right-buttons">
              <Tooltip text={tNav.newExpenseTooltip} pos="top-end">
                <Button
                  type="button"
                  variant="submit"
                  iconOnly={true}
                  onclick={() => (activeTab = "add")}
                >
                  <md-icon>post_add</md-icon>
                </Button>
              </Tooltip>
            </div>
          {/if}
        </div>
      </div>
    </footer>
  </div>
</div>

{#if showDraftModal}
  <Modal title={dict.admin.draftModal.title} onclose={handleDiscardDraft}>
    <div class="modal-body">
      <p>{dict.admin.draftModal.body1}</p>
      <p>{dict.admin.draftModal.body2}</p>
    </div>
    {#snippet actions()}
      <Button variant="secondary" onclick={handleDiscardDraft}>
        {dict.admin.draftModal.restart}
      </Button>
      <Button variant="primary" onclick={handleRestoreDraft}>
        {dict.admin.draftModal.continue}
      </Button>
    {/snippet}
  </Modal>
{/if}

{#if showLeaveConfirmModal}
  <Modal
    title={dict.admin.leaveModal.title}
    onclose={() => (showLeaveConfirmModal = false)}
  >
    <div class="modal-body">
      <p>{dict.admin.leaveModal.body}</p>
    </div>
    {#snippet actions()}
      <Button
        variant="secondary"
        onclick={() => (showLeaveConfirmModal = false)}
      >
        {dict.admin.leaveModal.cancel}
      </Button>
      <Button variant="danger" onclick={handleDiscardDraftAndLeave}>
        {dict.admin.leaveModal.discardAndLeave}
      </Button>
    {/snippet}
  </Modal>
{/if}

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
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .pro-body::-webkit-scrollbar-thumb {
    background-color: var(--glass-border);
    border-radius: var(--radius-xs);
  }

  .pro-body::-webkit-scrollbar-thumb:hover {
    background-color: var(--primary);
  }

  .pro-content {
    padding: var(--layout-py-base)
      calc(var(--layout-px-base) - var(--scrollbar-width)) var(--layout-py-base)
      var(--layout-px-base);
    margin: 0 auto;
    width: 100%;
    color: var(--text-primary);
    transition: max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Dynamic widths based on active tab */
  .pro-content.is-narrow {
    max-width: var(--form-max-width);
  }
  .pro-content.is-wide {
    max-width: var(--table-max-width);
  }

  .footer-content.is-wide {
    max-width: var(--table-max-width);
  }

  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: var(--gap-fields);
  }

  .left-buttons,
  .right-buttons {
    display: flex;
    gap: var(--gap-fields);
    align-items: center;
  }

  @media (max-width: 600px) {
    .pro-content {
      padding: var(--gap-fields);
    }
    .footer-content {
      padding: var(--gap-sm) var(--gap-fields);
    }
  }
</style>
