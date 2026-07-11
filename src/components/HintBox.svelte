<script>
  export let icon = "campaign"; // info
</script>

<div class="hint-box">
  <md-icon class="hint-icon">{icon}</md-icon>
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
</style>
