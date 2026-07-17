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
    padding: calc(var(--element-py) * 0.75) var(--element-px);
    gap: var(--gap-sm);
    color: var(--text-primary);
    font-size: var(--text-base);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .hint-icon {
    color: var(--primary);
    font-size: var(--text-3xl);
    --md-icon-size: var(--text-3xl);
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
