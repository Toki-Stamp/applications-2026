<script>
  import { fade } from "svelte/transition";

  /** @type {{ variant?: 'modal' | 'loading', absolute?: boolean, zIndex?: number, onclick?: (e: MouseEvent) => void, children?: import('svelte').Snippet }} */
  let {
    variant = "modal",
    absolute = false,
    zIndex = 9999,
    onclick = undefined,
    children,
  } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="ui-overlay variant-{variant}"
  class:absolute
  style:z-index={zIndex}
  transition:fade={{ duration: 200 }}
  {onclick}
  role="presentation"
>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .ui-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--layout-py-sm, 1rem) var(--layout-px-sm, 1rem);
  }

  .variant-modal {
    background: color-mix(in srgb, var(--bg-color) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .variant-loading {
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  .ui-overlay.absolute {
    position: absolute;
  }
</style>
