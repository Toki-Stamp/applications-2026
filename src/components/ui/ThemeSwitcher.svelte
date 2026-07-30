<script>
  import { onMount } from "svelte";
  import Tooltip from "./Tooltip.svelte";
  import Popover from "./Popover.svelte";

  const darkThemes = [
    { id: "cyberpunk", name: "Cyberpunk" },
    { id: "original", name: "Neon Pink" },
    { id: "mint", name: "Mint" },
    { id: "sunset", name: "Sunset" },
    { id: "ocean", name: "Ocean" },
    { id: "minimal", name: "Minimal" },
    { id: "military", name: "Military" },
    { id: "galaxy", name: "Galaxy" },
    { id: "marshmallow", name: "Marshmallow" },
    { id: "mocha", name: "Mocha" },
  ];

  const lightThemes = [
    { id: "light-daylight", name: "Daylight" },
    { id: "light-cotton", name: "Cotton" },
    { id: "light-sunrise", name: "Sunrise" },
    { id: "light-mint", name: "Mint" },
    { id: "light-sakura", name: "Sakura" },
    { id: "light-lemon", name: "Lemon" },
    { id: "light-lavender", name: "Lavender" },
    { id: "light-sand", name: "Sand" },
    { id: "light-military", name: "Military" },
    { id: "light-ocean", name: "Ocean" },
  ];

  const allThemes = [...darkThemes, ...lightThemes];

  let currentTheme = $state("cyberpunk");
  let isOpen = $state(false);

  /** @type {HTMLElement | null} */
  let anchorNode = $state(null);

  // Store computed colors to dynamically match themes.css
  /** @type {Record<string, {primary: string, accent: string}>} */
  let computedColors = $state({});

  onMount(() => {
    // Dynamically fetch actual CSS variables for each theme
    const root = document.documentElement;
    const originalTheme = root.getAttribute("data-theme");
    /** @type {Record<string, {primary: string, accent: string}>} */
    const colors = {};

    for (const theme of allThemes) {
      root.setAttribute("data-theme", theme.id);
      const computed = getComputedStyle(root);
      colors[theme.id] = {
        primary: computed.getPropertyValue("--primary").trim(),
        accent: computed.getPropertyValue("--accent").trim(),
      };
    }

    if (originalTheme) {
      root.setAttribute("data-theme", originalTheme);
    } else {
      root.removeAttribute("data-theme");
    }

    computedColors = colors;

    const saved = localStorage.getItem("app-theme");
    if (saved && allThemes.some((t) => t.id === saved)) {
      setTheme(saved);
    } else {
      setTheme("cyberpunk");
    }
  });

  /** @param {string} id */
  function setTheme(id) {
    document.documentElement.classList.add('theme-switching');
    currentTheme = id;
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("app-theme", id);
    isOpen = false;
    
    // Remove class after browser has painted the new theme
    setTimeout(() => {
      document.documentElement.classList.remove('theme-switching');
    }, 50);
  }
</script>

{#snippet themeButton(/** @type {{id: string, name: string}} */ theme)}
  <button
    type="button"
    class="theme-row-btn"
    class:active={currentTheme === theme.id}
    style="--t-primary: {computedColors[theme.id]?.primary ||
      'transparent'}; --t-accent: {computedColors[theme.id]?.accent ||
      'transparent'};"
    onclick={() => setTheme(theme.id)}
  >
    <div class="swatch-circle">
      <div class="color-half primary"></div>
      <div class="color-half accent"></div>
    </div>
    <span class="theme-name">{theme.name}</span>
    {#if currentTheme === theme.id}
      <md-icon class="active-icon">check</md-icon>
    {/if}
  </button>
{/snippet}

<div class="theme-switcher-wrapper" role="presentation">
  <div class="theme-switcher" bind:this={anchorNode}>
    <Tooltip text="Настроить тему" pos="bottom-left" variant="neon" enabled={!isOpen}>
      <button
        type="button"
        class="icon-btn"
        class:active={isOpen}
        onclick={() => (isOpen = !isOpen)}
        aria-label="Настроить тему"
      >
        <md-icon>settings</md-icon>
      </button>
    </Tooltip>
  </div>

  <Popover {isOpen} onclose={() => isOpen = false} pos="bottom-left" backdrop={true} width="min(var(--popover-width-sm), calc(100vw - calc(var(--gap-fields) * 2)))" referenceNode={anchorNode}>
    <div class="theme-popover-content">
      <div class="theme-category glass-header glass-header-primary">Тёмные темы</div>
      {#each darkThemes as theme}
        {@render themeButton(theme)}
      {/each}

      <div class="theme-category glass-header glass-header-primary">Светлые темы</div>
      {#each lightThemes as theme}
        {@render themeButton(theme)}
      {/each}
    </div>
  </Popover>
</div>

<style>
  .theme-switcher-wrapper {
    position: relative;
    display: inline-block;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: var(--text-2xl);
    --md-icon-size: var(--text-2xl);
    cursor: pointer;
    border-radius: 50%;
    width: var(--icon-btn-size);
    height: var(--icon-btn-size);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
  }

  .icon-btn md-icon {
    transition: transform 0.4s ease;
  }

  .icon-btn:hover,
  .theme-switcher-wrapper:focus-within .icon-btn {
    color: var(--primary);
  }

  .icon-btn:hover md-icon,
  .theme-switcher-wrapper:focus-within .icon-btn md-icon {
    transform: rotate(90deg);
  }

  .theme-popover-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    max-height: var(--popover-max-height);
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 0 var(--gap-sm) 0;
    border-radius: inherit;
  }

  .theme-popover-content::-webkit-scrollbar {
    width: var(--scrollbar-width-sm);
  }

  .theme-popover-content::-webkit-scrollbar-track {
    background: transparent;
    /* Хаком сдвигаем трек скроллбара вниз на высоту прилипающего заголовка (около 42px) */
    margin-top: 42px;
    margin-bottom: var(--radius-xs);
  }

  .theme-popover-content::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--primary) 30%, var(--text-primary) 10%);
    border-radius: var(--scrollbar-radius-sm);
  }

  .theme-popover-content::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--primary) 50%, var(--text-primary) 20%);
  }

  .theme-category {
    position: sticky;
    top: 0;
    z-index: 10;
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: var(--font-weight-bold);
    color: var(--primary);
    padding: var(--title-py-sm) calc(var(--gap-sm) * 2 + var(--scrollbar-width-sm)) var(--title-py-sm) calc(var(--gap-sm) * 2);
    /* Хак: растягиваем заголовок вправо на ширину скроллбара, чтобы не было дырки в углу */
    margin-right: calc(var(--scrollbar-width-sm) * -1);
  }

  .theme-category:not(:first-child) {
    margin-top: var(--gap-sm);
  }

  /* Плавное растворение правого края без маски (маска ломает backdrop-filter) */
  .theme-category::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: -1px;
    width: 24px;
    background: linear-gradient(to right, transparent, var(--bg-color-accent));
    pointer-events: none;
    border-radius: 0 var(--border-radius) 0 0;
  }

  .theme-row-btn {
    margin: 0 var(--gap-sm);
    width: calc(100% - calc(var(--gap-sm) * 2));
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--gap-sm);
    display: flex;
    align-items: center;
    gap: var(--gap-md);
    cursor: pointer;
    transition: all 0.2s ease-out;
    color: var(--text-primary);
    text-align: left;
  }

  .theme-name {
    flex: 1;
  }

  .active-icon {
    font-size: 1.2em;
    color: var(--primary);
  }

  .theme-row-btn:hover {
    background: color-mix(in srgb, var(--primary) 8%, transparent);
    color: var(--text-primary);
    box-shadow: 
      0 0 0 1px color-mix(in srgb, var(--primary) 50%, transparent),
      0 4px 12px color-mix(in srgb, var(--primary) 20%, transparent);
  }

  .theme-row-btn:hover .swatch-circle {
    transform: scale(1.15);
    box-shadow: 0 0 8px color-mix(in srgb, var(--t-primary) 40%, transparent);
  }

  .theme-row-btn.active {
    background: color-mix(in srgb, var(--primary) 20%, transparent);
    color: var(--text-primary);
    font-weight: var(--font-weight-extrabold);
    letter-spacing: 0.02em;
    box-shadow: 
      0 0 0 1px color-mix(in srgb, var(--primary) 50%, transparent),
      0 4px 12px color-mix(in srgb, var(--primary) 20%, transparent);
  }

  .theme-row-btn.active .swatch-circle {
    transform: scale(1.15);
    box-shadow: 0 0 8px color-mix(in srgb, var(--t-primary) 40%, transparent);
  }

  .swatch-circle {
    width: 24px;
    height: 24px;
    border-radius: var(--radius-full);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    border: 2px solid color-mix(in srgb, var(--t-primary) 50%, transparent);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
  }

  .color-half {
    width: 100%;
    height: 50%;
  }

  .color-half.primary {
    background-color: var(--t-primary);
  }
  .color-half.accent {
    background-color: var(--t-accent);
  }

  .theme-name {
    font-size: var(--text-sm);
    font-family: var(--font-family);
  }
</style>
