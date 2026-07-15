<script>
  import "@material/web/iconbutton/icon-button.js";
  import "@material/web/icon/icon.js";
  import { generateId } from "../../utils.js";
  import { onMount } from "svelte";
  import FieldLabel from "./FieldLabel.svelte";
  import Button from "../ui/Button.svelte";

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
    left: 16px;
    top: 16px;
    color: var(--text-secondary);
    pointer-events: none;
    z-index: 1;
    transition: color 0.2s;
  }

  .clear-button-wrapper {
    position: absolute;
    right: 16px;
    top: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-color-accent);
    border-radius: 50%;
    z-index: 10;
  }

  .custom-textarea {
    width: 100%;
    min-height: 104px; /* 3 rows: 32px padding + (24px * 3) */
    padding: 16px;
    padding-right: 52px; /* space for clear button */
    font-family: inherit;
    font-size: 1rem;
    color: var(--text-primary);
    caret-color: var(--primary);
    background-color: transparent;
    border: 1px solid var(--input-border-color);
    border-radius: 8px;
    resize: none;
    outline: none;
    overflow: hidden; /* Hide scrollbar since it grows infinitely */
    box-sizing: border-box;
    line-height: 1.5;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }

  .custom-textarea.has-icon {
    padding-left: 52px;
  }

  .custom-textarea:hover {
    border-color: var(--primary-hover);
  }

  .custom-textarea:focus {
    border-color: var(--primary);
    /* box-shadow to mimic Material Design thicker border */
    box-shadow: 0 0 0 2px var(--primary);
  }

  .custom-textarea::placeholder {
    color: var(--text-placeholder);
  }
</style>
