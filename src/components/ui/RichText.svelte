<script>
  let { content = [] } = $props();

  const parts = $derived(
    Array.isArray(content) ? content : typeof content === "string" ? [{ text: content }] : [content]
  );
</script>

{#each parts as part}
  {#if part.highlight}
    <strong class="text-primary" class:uppercase={part.upper}>{part.text}</strong>
  {:else if part.bold}
    <strong class:uppercase={part.upper}>{part.text}</strong>
  {:else if part.upper}
    <span class="uppercase">{part.text}</span>
  {:else}
    {part.text}
  {/if}
{/each}

<style>
  strong {
    color: var(--text-primary);
  }
  .text-primary {
    color: var(--primary);
  }
  .uppercase {
    text-transform: uppercase;
  }
</style>
