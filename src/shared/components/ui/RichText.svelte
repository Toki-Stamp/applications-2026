<script>
  let { content } = $props();

  const parts = $derived(
    Array.isArray(content)
      ? content
      : typeof content === "string"
        ? [{ text: content }]
        : content
          ? [content]
          : [],
  );
</script>

{#each parts as part}
  <span
    class:highlight={part.highlight}
    class:bold={part.bold}
    class:uppercase={part.upper}>{part.text}</span
  >
{/each}

<style>
  .bold {
    font-weight: bold;
    color: var(--text-primary);
  }
  .highlight {
    color: var(--primary);
  }
  .uppercase {
    text-transform: uppercase;
  }
</style>
