<script>
  import { slide } from "svelte/transition";
  import Button from "./Button.svelte";

  let {
    type = "info", // "info" | "error"
    icon = null, // optional override
    dismissible = false,
    children,
  } = $props();

  let visible = $state(true);

  const computedIcon = $derived(
    icon || (type === "error" ? "touch_app" : "campaign"),
  );
</script>

{#if visible}
<div class="hint-box" class:error={type === "error"} class:dismissible={dismissible} transition:slide={{ duration: 250 }}>
  <md-icon class="hint-icon">{computedIcon}</md-icon>
  <span class="hint-content">
    {#if children}{@render children()}{/if}
  </span>
  {#if dismissible}
    <div class="close-btn-wrapper">
      <Button variant="clear" aria-label="Закрыть" onclick={() => visible = false}>
        <md-icon>close</md-icon>
      </Button>
    </div>
  {/if}
</div>
{/if}

<style>
  .hint-box {
    display: flex;
    align-items: center;
    text-align: left;
    background: color-mix(in srgb, var(--bg-color-accent) 90%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
    border-left: 4px solid var(--primary);
    border-radius: 8px;
    padding: calc(var(--element-py) * 0.75) var(--element-px);
    gap: var(--gap-sm);
    color: var(--text-primary);
    font-size: var(--text-base);
    box-shadow: var(--shadow-sm);
  }

  .hint-box.dismissible {
    padding-right: var(--gap-sm);
  }

  .hint-icon {
    color: var(--primary);
    font-size: var(--text-3xl);
    --md-icon-size: var(--text-3xl);
    flex-shrink: 0;
  }

  /* Clearfix for float if needed */
  .hint-box::after {
    content: "";
    display: table;
    clear: both;
  }

  @media (max-width: 600px) {
    .hint-box {
      display: block;
      text-align: justify;
      -webkit-hyphens: auto;
      hyphens: auto;
    }
    .hint-icon {
      float: left;
      margin-right: var(--gap-sm);
      margin-top: 2px; /* slight adjustment to align with first line of text */
      margin-bottom: 4px;
    }
  }

  .hint-box.error {
    border-color: color-mix(in srgb, var(--error-color) 25%, transparent);
    border-left-color: var(--error-color);
    background: color-mix(in srgb, var(--error-color) 10%, transparent);
  }

  .hint-box.error .hint-icon {
    color: var(--error-color);
  }

  .hint-content {
    flex: 1;
  }

  .close-btn-wrapper {
    margin-left: var(--gap-sm);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
