<script>
  let { label = "", helperText = "", required = false } = $props();
</script>

{#if label || helperText}
  <div class="label-container">
    {#if label}
      <div class="group-label">
        {label}
        <span class="optional-tag">
          {required ? "(Обязательно для заполнения)" : ""}
        </span>
      </div>
    {/if}
    {#if helperText}
      <div class="helper-text">
        <strong>Подсказка:</strong> {helperText}
      </div>
    {/if}
  </div>
{/if}

<style>
  .label-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .group-label {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: baseline;
    column-gap: 0.5rem;
    row-gap: 0.2rem;
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1rem;
  }

  .helper-text {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .optional-tag {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--accent);
    text-align: right;
  }
</style>
