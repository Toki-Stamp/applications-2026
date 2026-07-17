<script>
  import { gridExpand } from "../../utils.js";

  /**
   * @typedef {Object} Props
   * @property {boolean} show
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { show = false, children } = $props();

  import { untrack } from "svelte";
  let overflowVisible = $state(untrack(() => show));

  $effect(() => {
    if (!show) {
      overflowVisible = false;
    }
  });
</script>

{#if show}
  <div
    class="expandable-wrapper"
    transition:gridExpand
    onintroend={() => (overflowVisible = true)}
    onoutrostart={() => (overflowVisible = false)}
  >
    <div
      class="expandable-inner"
      style="overflow: {overflowVisible ? 'visible' : 'hidden'};"
    >
      <div class="expandable-content">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<style>
  .expandable-wrapper {
    width: 100%;
  }

  .expandable-inner {
    min-height: 0;
  }

  .expandable-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-section);
  }
</style>
