<script>
  let {
    type = "info", // "info" | "error"
    icon = null, // optional override
    children,
  } = $props();

  const computedIcon = $derived(
    icon || (type === "error" ? "touch_app" : "campaign"),
  );
</script>

<div class="hint-box" class:error={type === "error"}>
  <md-icon class="hint-icon">{computedIcon}</md-icon>
  <span
    >{#if children}{@render children()}{/if}</span
  >
</div>

<style>
  .hint-box {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
    border-left: 4px solid var(--primary);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
    color: var(--text-primary);
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .hint-icon {
    color: var(--primary);
    font-size: 1.8rem;
    flex-shrink: 0;
  }

  .hint-box.error {
    border-color: color-mix(in srgb, var(--error-color) 25%, transparent);
    border-left-color: var(--error-color);
    background: color-mix(in srgb, var(--error-color) 10%, transparent);
  }

  .hint-box.error .hint-icon {
    color: var(--error-color);
  }
</style>
