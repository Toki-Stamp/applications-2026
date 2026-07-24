<script>
  let { 
    /** @type {'primary' | 'accent'} */
    variant = "primary", 
    children 
  } = $props();
</script>

<kbd class:accent-key={variant === 'accent'}>
  {#if children}{@render children()}{/if}
</kbd>

<style>
  kbd {
    background: color-mix(in srgb, var(--primary) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
    border-bottom: 2px solid color-mix(in srgb, var(--primary) 60%, transparent);
    border-radius: 4px;
    padding: 0.15rem 0.4rem;
    font-size: 0.75rem;
    font-family: var(--font-family);
    font-weight: 700;
    color: var(--primary);
    box-shadow: 0 2px 4px color-mix(in srgb, var(--primary) 20%, transparent);
    vertical-align: middle;
    position: relative;
    top: -1px;
    margin: 0 0.1em;
  }

  kbd.accent-key {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-bottom: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
    color: var(--accent);
    box-shadow: 0 2px 4px color-mix(in srgb, var(--accent) 20%, transparent);
  }
</style>
