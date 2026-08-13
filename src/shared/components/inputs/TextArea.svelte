<script>
  import "@material/web/iconbutton/icon-button.js";
  import "@material/web/icon/icon.js";
  import { generateId } from "$shared/utils.js";
  import { onMount } from "svelte";
  import FieldLabel from "./FieldLabel.svelte";
  import Button from "$shared/components/ui/Button.svelte";

  let {
    value = $bindable(""),
    label = "",
    helperText = "",
    required = false,
    placeholder = "",
    icon = "",
    id = generateId("textarea"),
    ...restProps
  } = $props();

  /** @type {HTMLTextAreaElement} */
  let textareaRef;

  function adjustHeight() {
    if (!textareaRef) return;
    textareaRef.style.height = "auto";
    textareaRef.style.height = textareaRef.scrollHeight + "px";
  }

  onMount(() => {
    // Initial adjustment on mount
    adjustHeight();
  });

  /** @param {Event} e */
  function handleInput(e) {
    const target = /** @type {HTMLTextAreaElement} */ (e.target);
    value = target.value;
    adjustHeight();
  }

  /** @param {Event} e */
  function clearValue(e) {
    e.preventDefault();
    value = "";
    if (textareaRef) {
      textareaRef.value = "";
    }
    adjustHeight();
  }
</script>

<div class="form-group">
  <FieldLabel {label} {helperText} {required} />

  <div class="input-wrapper">
    {#if icon}
      <md-icon class="leading-icon">{icon}</md-icon>
    {/if}
    <textarea
      bind:this={textareaRef}
      class="custom-textarea"
      class:has-icon={icon !== ""}
      rows="3"
      {required}
      {id}
      {placeholder}
      {value}
      oninput={handleInput}
      {...restProps}></textarea>
    {#if value && String(value).length > 0}
      <div class="clear-button-wrapper">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <Button variant="clear" onclick={clearValue}>
          <md-icon>close</md-icon>
        </Button>
      </div>
    {/if}
  </div>
</div>

<style>
  .input-wrapper {
    position: relative;
    display: flex;
    width: 100%;
  }

  .leading-icon {
    position: absolute;
    left: var(--element-px);
    top: var(--element-py);
    font-size: var(--text-2xl);
    width: var(--text-2xl);
    height: var(--text-2xl);
    color: var(--text-secondary);
    pointer-events: none;
    z-index: var(--z-base);
    transition: color var(--transition-normal);
  }

  .clear-button-wrapper {
    position: absolute;
    right: var(--element-px);
    top: calc(var(--element-py) - 2px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-color-accent);
    border-radius: var(--radius-full);
    z-index: var(--z-controls);
  }

  .custom-textarea {
    width: 100%;
    --md-outlined-text-field-container-shape: var(--radius-sm);
    --md-outlined-field-leading-space: 12px;
    --md-outlined-field-content-space: 12px;
    min-height: var(--textarea-min-height); /* 3 rows: 32px padding + (24px * 3) */
    padding: var(--element-py) var(--element-px);
    padding-right: calc(
      var(--element-px) * 2 + var(--text-2xl)
    ); /* space for clear button */
    font-family: inherit;
    font-size: var(--text-base);
    color: var(--text-primary);
    caret-color: var(--primary);
    background-color: transparent;
    border: var(--border-width-thin) solid var(--input-border-color);
    border-radius: var(--radius-sm);
    resize: none;
    outline: none;
    overflow: hidden; /* Hide scrollbar since it grows infinitely */
    box-sizing: border-box;
    line-height: var(--line-height-normal);
    transition:
      border-color var(--transition-normal),
      box-shadow var(--transition-normal);
  }

  .custom-textarea.has-icon {
    padding-left: calc(var(--element-px) * 2 + var(--text-2xl));
  }

  .custom-textarea:hover {
    border-color: var(--primary-hover);
  }

  .custom-textarea:focus {
    border-color: var(--primary);
    /* box-shadow to mimic Material Design thicker border */
    box-shadow: var(--focus-ring-shadow);
  }

  .custom-textarea::placeholder {
    color: var(--text-placeholder);
  }
</style>
