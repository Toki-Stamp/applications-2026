<script>
  import { getContext } from "svelte";
  import Tooltip from "$shared/components/ui/Tooltip.svelte";
  import Button from "$shared/components/ui/Button.svelte";
  import { slide } from "svelte/transition";

  let {
    participants = [],
    filterMode = $bindable(false),
  } = $props();

  /** @type {import('$apps/applications/gridStore.svelte.js').GridState} */
  const gridState = getContext("gridState");

  // Stats computation
  let stats = $derived.by(() => gridState.getStats(participants));

  let groupedFilters = $derived.by(() => {
    /** @type {Record<string, { catText: string, catIcon?: string, filters: {key: string, value: string, details: any}[] }>} */
    const groups = {};
    for (const [key, filter] of Object.entries(gridState.activeFilters)) {
      const values = filter.values || [filter.value];
      for (const val of values) {
        const details = gridState.getFilterDetails(`${key}_${val}`);
        const catText =
          details?.catText ||
          (key.startsWith("to")
            ? "ТУДА"
            : key.startsWith("from")
              ? "ОБРАТНО"
              : "Разное");
        const catIcon = details?.catIcon;
        if (!groups[catText]) {
          groups[catText] = { catText, catIcon, filters: [] };
        }
        groups[catText].filters.push({ key, value: val, details });
      }
    }
    /** @type {Record<string, number>} */
    const keyOrder = {
      to: 1,
      toCity: 2,
      toDay: 3,
      toTime: 4,
      toSeats: 5,
      from: 1,
      fromCity: 2,
      fromDay: 3,
      fromTime: 4,
      fromSeats: 5,
    };

    for (let group of Object.values(groups)) {
      group.filters.sort(
        (a, b) => (keyOrder[a.key] || 99) - (keyOrder[b.key] || 99),
      );
    }

    return Object.values(groups).sort((a, b) => {
      const orderA = a.catText === "ТУДА" ? 1 : a.catText === "ОБРАТНО" ? 2 : 3;
      const orderB = b.catText === "ТУДА" ? 1 : b.catText === "ОБРАТНО" ? 2 : 3;
      return orderA - orderB;
    });
  });

  /** @type {HTMLElement | null} */
  let scrollContainer = $state(null);
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  function checkScroll() {
    if (scrollContainer) {
      canScrollLeft = scrollContainer.scrollLeft > 0;
      canScrollRight =
        Math.ceil(scrollContainer.scrollLeft + scrollContainer.clientWidth) <
        scrollContainer.scrollWidth;
    }
  }

  $effect(() => {
    groupedFilters; // React to changes
    setTimeout(checkScroll, 50);
  });

  $effect(() => {
    if (scrollContainer) {
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(scrollContainer);
      return () => resizeObserver.disconnect();
    }
  });
</script>

{#if gridState.hasAnyFilterOrSearch}
  <footer
    class="layout-footer summary-footer"
    transition:slide={{ duration: 250, axis: "y" }}
  >
    <div class="footer-content">
      <div class="left-container">
        <Tooltip text="Сбросить всё" pos="left">
          <Button
            variant="danger"
            iconOnly={true}
            aria-label="Сбросить всё"
            onclick={() => {
              gridState.clearAllFilters();
              filterMode = false;
            }}
          >
            <md-icon>delete</md-icon>
          </Button>
        </Tooltip>
        {#if groupedFilters.length > 0}
          <div class="scroll-wrapper">
            <button
              class="scroll-indicator left"
              disabled={!canScrollLeft}
              onclick={() =>
                scrollContainer?.scrollBy({ left: -200, behavior: "smooth" })}
            >
              <md-icon class="arrow-icon">chevron_left</md-icon>
            </button>
            <div
              class="left-buttons"
              bind:this={scrollContainer}
              onscroll={checkScroll}
              class:mask-l={canScrollLeft}
              class:mask-r={canScrollRight}
            >
              <div class="filter-groups">
                {#each groupedFilters as group}
                  <div class="filter-group">
                    <div class="group-header">
                      <span class="group-title">{group.catText}</span>
                      <Button
                        variant="clear"
                        class="group-close-btn"
                        onclick={() => {
                          const newFilters = { ...gridState.activeFilters };
                          group.filters.forEach((f) => delete newFilters[f.key]);
                          gridState.activeFilters = newFilters;
                        }}
                      >
                        <md-icon>close</md-icon>
                      </Button>
                    </div>
                    <div class="group-values">
                      {#each group.filters as { key, value, details }}
                        <div class="val-chip">
                          <Tooltip
                            text={details?.tooltip || details?.valText || value}
                            pos="top"
                          >
                            <div class="val-chip-content">
                              {#if details?.valIcon}<md-icon
                                  >{details.valIcon}</md-icon
                                >{/if}
                              {#if !details?.hideValText}<span
                                  >{details?.valText}</span
                                >{/if}
                            </div>
                          </Tooltip>
                          <Button
                            variant="clear"
                            class="chip-close-btn"
                            onclick={() => gridState.toggleFilter(key, value)}
                          >
                            <md-icon>close</md-icon>
                          </Button>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
            <button
              class="scroll-indicator right"
              disabled={!canScrollRight}
              onclick={() =>
                scrollContainer?.scrollBy({ left: 200, behavior: "smooth" })}
            >
              <md-icon class="arrow-icon">chevron_right</md-icon>
            </button>
          </div>
        {/if}
      </div>
      <div class="right-buttons">
        <div class="intersection-count">
          <span class="count-label">Найдено:</span>
          <span class="count-number">{stats.matched}</span>
        </div>
        <div class="summary-badge">
          <Tooltip
            text={filterMode ? "Сбросить режим" : "Показать только найденные"}
            pos="right"
          >
            <Button
              variant={filterMode ? "primary" : "secondary"}
              iconOnly={true}
              onclick={() => {
                filterMode = !filterMode;
              }}
            >
              <md-icon>{filterMode ? "visibility_off" : "visibility"}</md-icon>
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  </footer>
{/if}

<style>
  .summary-footer {
    position: sticky !important;
    bottom: 0;
    margin-top: auto;
    /* Generic footer provides standard border-top, this override is not strictly needed anymore, but keeps it explicit */
  }

  .footer-content {
    max-width: var(--table-max-width);
    margin: 0 auto;
    padding: 0.75rem var(--gap-layout);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-fields);
    width: 100%;
    box-sizing: border-box;
  }

  .left-container {
    display: flex;
    align-items: center;
    gap: var(--gap-fields);
    flex: 1;
    min-width: 0;
  }

  .scroll-wrapper {
    display: flex;
    flex: 1;
    min-width: 0;
    gap: var(--gap-xs);
    align-items: stretch;
  }

  .scroll-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    background: transparent;
    border: none;
    color: var(--primary);
    cursor: pointer;
    transition:
      opacity 0.2s,
      color 0.2s;
    padding: 0;
    flex-shrink: 0;
  }
  .scroll-indicator:disabled {
    opacity: 0.2;
    cursor: default;
  }
  .scroll-indicator:not(:disabled):hover {
    color: var(--text-primary);
  }
  .scroll-indicator md-icon.arrow-icon {
    font-size: 2rem;
    --md-icon-size: 2rem;
    font-variation-settings: "wght" 700;
  }

  .left-buttons {
    display: flex;
    align-items: flex-start;
    gap: var(--gap-sm);
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .left-buttons::-webkit-scrollbar {
    display: none;
  }

  .left-buttons.mask-l.mask-r {
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 24px,
      black calc(100% - 24px),
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 24px,
      black calc(100% - 24px),
      transparent 100%
    );
  }
  .left-buttons.mask-l:not(.mask-r) {
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 24px);
    mask-image: linear-gradient(to right, transparent 0%, black 24px);
  }
  .left-buttons.mask-r:not(.mask-l) {
    -webkit-mask-image: linear-gradient(
      to right,
      black calc(100% - 24px),
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      black calc(100% - 24px),
      transparent 100%
    );
  }

  .filter-groups {
    display: flex;
    gap: var(--gap-sm);
    align-items: flex-start;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
    background: color-mix(in srgb, var(--primary) 5%, transparent);
    overflow: hidden;
  }

  .group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-xs);
    padding: 0 var(--gap-sm);
    height: 24px;
    box-sizing: border-box;
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    color: color-mix(in srgb, var(--primary) 90%, var(--text-secondary));
    border-bottom: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
  }

  .group-title {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: inherit;
    line-height: 1;
    display: flex;
    align-items: center;
  }

  :global(.group-close-btn) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 16px !important;
    height: 16px !important;
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
    color: inherit !important;
    border-radius: 4px !important;
  }
  :global(.group-close-btn md-icon) {
    font-size: 0.9rem !important;
    --md-icon-size: 0.9rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    transform: translateY(1px);
  }
  :global(.group-close-btn:hover) {
    background: color-mix(
      in srgb,
      var(--primary) 20%,
      var(--glass-border-hover)
    ) !important;
  }

  .group-values {
    display: flex;
    align-items: center;
    padding: var(--gap-xs) var(--gap-sm);
    gap: var(--gap-xs);
    flex-wrap: nowrap;
  }

  .val-chip {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    padding: 0 var(--gap-xs) 0 var(--gap-sm);
    height: 22px;
    box-sizing: border-box;
    background: color-mix(in srgb, var(--primary) 10%, transparent);
    border-radius: 6px;
    color: var(--primary);
    font-size: var(--text-sm);
    font-weight: 500;
    line-height: 1;
  }

  .val-chip-content {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    cursor: default;
  }

  .val-chip md-icon {
    font-size: 1.1rem;
    --md-icon-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  :global(.chip-close-btn) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 16px !important;
    height: 16px !important;
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
    color: inherit !important;
    border-radius: 4px !important;
  }
  :global(.chip-close-btn md-icon) {
    font-size: 0.9rem !important;
    --md-icon-size: 0.9rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    transform: translateY(1px);
  }
  :global(.chip-close-btn:hover) {
    background: color-mix(
      in srgb,
      var(--primary) 20%,
      var(--glass-border-hover)
    ) !important;
  }

  .right-buttons {
    display: flex;
    align-items: center;
    gap: var(--gap-section);
  }

  .intersection-count {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
  }
  .intersection-count .count-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
  }
  .intersection-count .count-number {
    font-size: var(--text-lg);
    font-weight: 800;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  .summary-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: transparent;
    border: none;
    box-shadow: none;
    font-size: var(--text-md);
    font-weight: 700;
  }

  @media (max-width: 600px) {
    .footer-content {
      padding: var(--gap-sm) var(--layout-px-sm);
      gap: var(--gap-xs);
    }
    .left-container {
      gap: var(--gap-xs);
    }
    .scroll-indicator {
      width: 12px;
    }
    .scroll-indicator md-icon.arrow-icon {
      font-size: 1.75rem;
      --md-icon-size: 1.75rem;
    }
    .left-buttons {
      gap: var(--gap-xs);
    }
    .filter-groups {
      gap: var(--gap-xs);
    }
    .right-buttons {
      gap: var(--gap-sm);
    }
    .intersection-count .count-label {
      display: none;
    }
    .intersection-count .count-number {
      font-size: 1.25rem;
    }
    .group-header {
      padding: 0 var(--gap-xs);
      height: 22px;
    }
    .group-title {
      font-size: 0.7rem;
      line-height: 1;
    }
    .group-values {
      padding: 0.2rem;
      gap: 0.15rem;
    }
    .val-chip {
      padding: 0 0 0 0.35rem;
      height: 20px;
      gap: 2px;
      font-size: 0.7rem;
      line-height: 1;
    }
    :global(.chip-close-btn),
    :global(.group-close-btn) {
      width: 14px !important;
      height: 14px !important;
    }
    :global(.chip-close-btn md-icon),
    :global(.group-close-btn md-icon) {
      font-size: 0.8rem !important;
      --md-icon-size: 0.8rem !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
      transform: translateY(1px);
    }
  }
</style>
