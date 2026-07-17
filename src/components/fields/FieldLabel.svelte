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
        <strong>Подсказка:</strong>
        {helperText}
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
    column-gap: var(--gap-sm);
    row-gap: 0.2rem;
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--text-base);
  }

  .helper-text {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  @media (max-width: 600px) {
    .helper-text {
      text-align: justify;
      -webkit-hyphens: auto;
      hyphens: auto;
    }
  }

  .optional-tag {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--accent);
    text-align: right;
  }
</style>
