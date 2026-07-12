<script>
  export let type = "info"; // "info" | "error"
  export let icon = null; // optional override

  $: computedIcon = icon || (type === "error" ? "touch_app" : "campaign");
</script>

<div class="hint-box" class:error={type === "error"}>
  <md-icon class="hint-icon">{computedIcon}</md-icon>
  <span><slot></slot></span>
</div>

<style>
  .hint-box {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
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
    border-left-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
  }

  .hint-box.error .hint-icon {
    color: #ef4444;
  }
</style>
