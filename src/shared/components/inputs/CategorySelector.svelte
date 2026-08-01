<script lang="ts">
  import "@material/web/icon/icon.js";
  import Tooltip from "../ui/Tooltip.svelte";

  /**
   * @type {{
   *   options?: {id: string, label: string, icon?: string}[],
   *   selectedId: string
   * }}
   */
  let {
    options = [],
    selectedId = $bindable()
  } = $props();

  $effect(() => {
    if (!selectedId && options.length > 0) {
      selectedId = options[0].id;
    }
  });

  let isMobile = $state(false);
  let hideMobileTooltip = $state(false);

  $effect(() => {
    const media = window.matchMedia("(max-width: 599px)");
    isMobile = media.matches;
    const listener = (e: MediaQueryListEvent) => isMobile = e.matches;
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  });

  $effect(() => {
    if (!isMobile) return;
    const onScroll = () => {
      if (!hideMobileTooltip) hideMobileTooltip = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  });

  function selectOption(id: string) {
    selectedId = id;
    hideMobileTooltip = false;
  }
</script>

<div class="category-selector-wrapper">
  <div class="cards-grid">
    {#each options as opt, i}
      <Tooltip 
        text={opt.label} 
        enabled={isMobile}
        forceVisible={isMobile && selectedId === opt.id && !hideMobileTooltip} 
        pos={i === 0 ? 'top-start' : i === options.length - 1 ? 'top-end' : 'top'} 
        offset={8}
        wrapperClass="card-tooltip-wrapper"
      >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
          class="category-card" 
          class:selected={selectedId === opt.id}
          onclick={() => selectOption(opt.id)}
        >
          {#if opt.icon}
            <div class="card-icon-left">
              <md-icon>{opt.icon}</md-icon>
            </div>
          {/if}
          <div class="card-content desktop-only">
            <span class="card-label">{opt.label}</span>
          </div>
        <div class="card-checkbox">
          {#if selectedId === opt.id}
            <md-icon>check_circle</md-icon>
          {:else}
            <md-icon>radio_button_unchecked</md-icon>
          {/if}
        </div>
        </div>
      </Tooltip>
    {/each}
  </div>
</div>

<style>
  .category-selector-wrapper {
    width: 100%;
    font-family: var(--font-family);
  }

  .cards-grid {
    display: grid;
    /* Используем minmax(0, 1fr) вместо 1fr, чтобы длинные слова не растягивали колонку! */
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    width: 100%;
  }

  :global(.card-tooltip-wrapper) {
    display: flex !important;
    width: 100%;
    height: 100%;
  }

  .category-card {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2px;
    background: transparent;
    border: 1px solid var(--input-border-color);
    border-radius: var(--radius-sm);
    padding: 8px;
    min-height: 56px;
    box-sizing: border-box;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
    user-select: none;
    position: relative; /* Для позиционирования тултипа */
  }

  @media (hover: hover) {
    .category-card:hover {
      border-color: var(--primary-hover);
    }
  }

  .category-card.selected {
    border-color: var(--primary);
    background-color: rgba(255, 165, 0, 0.05); /* Как в SelectionGrid */
    box-shadow: 0 0 0 1px var(--primary);
  }

  .card-icon-left {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: var(--gap-sm, 8px); 
  }
  
  .card-checkbox {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  :global(.card-icon-left md-icon) {
    font-size: var(--text-2xl) !important;
    --md-icon-size: var(--text-2xl) !important;
    width: var(--text-2xl) !important;
    height: var(--text-2xl) !important;
    color: var(--text-secondary) !important;
    fill: var(--text-secondary) !important;
    transition: all 0.2s;
  }

  :global(.card-checkbox md-icon) {
    font-size: var(--text-xl) !important;
    --md-icon-size: var(--text-xl) !important;
    width: var(--text-xl) !important;
    height: var(--text-xl) !important;
    color: var(--text-secondary) !important;
    fill: var(--text-secondary) !important;
    transition: all 0.2s;
  }

  .card-content {
    flex: 1;
    display: none;
    flex-direction: column;
    justify-content: center;
  }

  .card-label {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--text-primary);
    text-align: left;
    line-height: 1.2;
    /* Позволяем длинным словам переноситься, чтобы не ломать ширину карточки */
    word-break: break-word;
    hyphens: auto;
  }

  :global(.category-card.selected .card-icon-left md-icon),
  :global(.category-card.selected .card-checkbox md-icon) {
    color: var(--primary) !important;
    fill: var(--primary) !important;
  }
  
  .category-card {
    justify-content: space-around; /* На мобилке раскидываем иконку и чекбокс */
  }
  
  /* На десктопе возвращаем классический вид */
  @media (min-width: 600px) {
    .cards-grid {
      gap: 12px;
    }
    .category-card {
      padding: 12px;
      gap: 8px;
      justify-content: space-between;
    }
    .card-content.desktop-only {
      display: flex; /* Показываем текст на больших экранах */
    }
  }
</style>
