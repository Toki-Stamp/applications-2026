<script>
  import { onMount } from "svelte";
  import Block from "$shared/components/layout/Block.svelte";
  import Section from "$shared/components/layout/Section.svelte";
  import CategorySelector from "$shared/components/inputs/CategorySelector.svelte";
  import TextInput from "$shared/components/inputs/TextInput.svelte";
  import MoneyInput from "$shared/components/inputs/MoneyInput.svelte";
  import TextArea from "$shared/components/inputs/TextArea.svelte";
  import AutocompleteInput from "$shared/components/inputs/AutocompleteInput.svelte";
  import { adminStore } from "../store.svelte.js";
  import { dict } from "$shared/locales/ru.js";

  import { EXPENSE_DRAFT_STORAGE_KEY } from "$shared/constants.js";

  const t = dict.admin.expenseForm;

  /**
   * @typedef {Object} Props
   * @property {Function} [onready]
   * @property {Function} [onsuccess]
   * @property {boolean} [hasErrors]
   */

  /** @type {Props} */
  let { onready, onsuccess, hasErrors = $bindable(false) } = $props();

  function loadInitialDraft() {
    if (typeof window === "undefined")
      return { category: "", name: "", amount: "", payer: "", comment: "" };
    try {
      const stored = localStorage.getItem(EXPENSE_DRAFT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Expense draft parse error", e);
    }
    return { category: "", name: "", amount: "", payer: "", comment: "" };
  }

  const initialDraft = loadInitialDraft();

  let category = $state(initialDraft.category || "");
  let name = $state(initialDraft.name || "");
  let amount = $state(initialDraft.amount || "");
  let payer = $state(initialDraft.payer || "");
  let comment = $state(initialDraft.comment || "");

  // Autosave draft to localStorage
  $effect(() => {
    if (typeof window === "undefined") return;
    const hasData =
      !!category ||
      !!name.trim() ||
      !!amount ||
      !!payer.trim() ||
      !!comment.trim();

    if (hasData) {
      localStorage.setItem(
        EXPENSE_DRAFT_STORAGE_KEY,
        JSON.stringify({ category, name, amount, payer, comment }),
      );
    } else {
      localStorage.removeItem(EXPENSE_DRAFT_STORAGE_KEY);
    }
  });

  const categories = t.categories;

  // Track touched fields and form submission to show validation errors
  let isSubmitted = $state(false);
  let touchedFields = $state(new Set());

  /** @param {string} field */
  function markTouched(field) {
    if (!touchedFields.has(field)) {
      const next = new Set(touchedFields);
      next.add(field);
      touchedFields = next;
    }
  }

  /** @param {string} field */
  function isEvaluated(field) {
    return isSubmitted || touchedFields.has(field);
  }

  let nameError = $derived(
    isEvaluated("name") && !name.trim() ? t.errors.name : "",
  );
  let amountError = $derived(
    isEvaluated("amount") && (!amount || Number(amount) <= 0)
      ? t.errors.amount
      : "",
  );
  let payerError = $derived(
    isEvaluated("payer") && !payer.trim() ? t.errors.payer : "",
  );
  let categoryError = $derived(
    isEvaluated("category") && !category ? t.errors.category : "",
  );

  let isFormIncomplete = $derived(
    !category ||
      !name.trim() ||
      !amount ||
      Number(amount) <= 0 ||
      !payer.trim(),
  );

  let currentHasErrors = $derived(
    !!categoryError || !!nameError || !!amountError || !!payerError,
  );

  $effect(() => {
    hasErrors = currentHasErrors;
  });

  function handleSubmit() {
    isSubmitted = true;
    if (isFormIncomplete) return;

    adminStore.addExpense({
      category,
      name: name.trim(),
      amount: Number(amount),
      payer: payer.trim(),
      comment: comment.trim(),
    });

    // Reset form and clear draft
    if (typeof window !== "undefined") {
      localStorage.removeItem(EXPENSE_DRAFT_STORAGE_KEY);
    }
    isSubmitted = false;
    touchedFields = new Set();
    category = "";
    name = "";
    amount = "";
    payer = "";
    comment = "";

    onsuccess?.();
  }

  onMount(() => {
    onready?.({ submit: handleSubmit });
  });
</script>

<Block title={t.blockTitle} icon="post">
  <Section isFirst={true}>
    <CategorySelector
      label={t.categoryLabel}
      required={true}
      options={categories}
      bind:selectedId={category}
      onchange={() => markTouched("category")}
      errorText={categoryError}
    />

    <TextInput
      label={t.nameLabel}
      icon="shopping_bag"
      placeholder={t.namePlaceholder}
      bind:value={name}
      onblur={() => markTouched("name")}
      onchange={() => markTouched("name")}
      errorText={nameError}
      required={true}
    />

    <MoneyInput
      label={t.amountLabel}
      currency={t.currency}
      placeholder={t.amountPlaceholder}
      bind:value={amount}
      onblur={() => markTouched("amount")}
      onchange={() => markTouched("amount")}
      errorText={amountError}
      required={true}
    />

    <AutocompleteInput
      label={t.payerLabel}
      icon="person"
      placeholder={t.payerPlaceholder}
      options={adminStore.uniquePayers}
      bind:value={payer}
      onblur={() => markTouched("payer")}
      onchange={() => markTouched("payer")}
      errorText={payerError}
      capitalizeFirst={true}
      required={true}
    />

    <TextArea
      label={t.commentLabel}
      icon="edit_note"
      placeholder={t.commentPlaceholder}
      helperText={t.commentHint}
      bind:value={comment}
    />
  </Section>
</Block>

<style>
</style>
