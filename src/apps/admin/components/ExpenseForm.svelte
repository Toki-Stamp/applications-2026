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

  const t = dict.admin.expenseForm;

  let { onready } = $props();

  let category = $state("");
  let name = $state("");
  let amount = $state("");
  let payer = $state("");
  let comment = $state("");

  const categories = t.categories;

  // Track if form is submitted to show validation errors
  let isSubmitted = $state(false);

  let nameError = $derived(isSubmitted && !name.trim() ? t.errors.name : "");
  let amountError = $derived(
    isSubmitted && (!amount || Number(amount) <= 0) ? t.errors.amount : "",
  );
  let payerError = $derived(isSubmitted && !payer.trim() ? t.errors.payer : "");
  let categoryError = $derived(
    isSubmitted && !category ? t.errors.category : "",
  );

  let isFormValid = $derived(
    !categoryError && !nameError && !amountError && !payerError,
  );

  function handleSubmit() {
    isSubmitted = true;
    if (!isFormValid) return;

    adminStore.addExpense({
      category,
      name: name.trim(),
      amount: Number(amount),
      payer: payer.trim(),
      comment: comment.trim(),
    });

    // Reset form
    isSubmitted = false;
    category = "";
    name = "";
    amount = "";
    payer = "";
    comment = "";

    // Show toast (assume we will implement toast, for now just reset)
  }

  onMount(() => {
    onready?.({ submit: handleSubmit });
  });
</script>

<Block title={t.blockTitle} icon="receipt">
  <Section isFirst={true}>
    <CategorySelector
      label={t.categoryLabel}
      required={true}
      options={categories}
      bind:selectedId={category}
      errorText={categoryError}
    />

    <TextInput
      label={t.nameLabel}
      icon="label"
      placeholder={t.namePlaceholder}
      bind:value={name}
      errorText={nameError}
      required={true}
    />

    <MoneyInput
      label={t.amountLabel}
      currency={t.currency}
      placeholder={t.amountPlaceholder}
      bind:value={amount}
      errorText={amountError}
      required={true}
    />

    <AutocompleteInput
      label={t.payerLabel}
      icon="person"
      placeholder={t.payerPlaceholder}
      options={adminStore.uniquePayers}
      bind:value={payer}
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
