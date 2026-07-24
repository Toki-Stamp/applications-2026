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
    currentTheme = id;
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("app-theme", id);
    isOpen = false;
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
  </button>
{/snippet}

<div class="theme-switcher-wrapper" role="presentation">
  <Tooltip text="Настроить тему" pos="bottom-left" variant="neon" enabled={!isOpen}>
    <button
      type="button"
      class="icon-btn"
      onclick={() => (isOpen = !isOpen)}
      aria-label="Выбрать тему оформления"
    >
      <md-icon>settings</md-icon>
    </button>
  </Tooltip>

  <Popover {isOpen} onclose={() => isOpen = false} pos="bottom-left" backdrop={true} width="220px">
    <div class="theme-popover-content">
      <div class="theme-category">Тёмные темы</div>
      {#each darkThemes as theme}
        {@render themeButton(theme)}
      {/each}

      <div class="theme-category">Светлые темы</div>
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
    width: 48px;
    height: 48px;
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
    max-height: 260px;
    overflow-y: auto;
    padding: 0 0 var(--gap-sm) 0;
    border-radius: inherit;
  }

  .theme-popover-content::-webkit-scrollbar {
    width: 6px;
  }

  .theme-popover-content::-webkit-scrollbar-track {
    background: transparent;
    margin-top: 12px;
    margin-bottom: 12px;
  }

  .theme-popover-content::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--primary) 30%, var(--text-primary) 10%);
    border-radius: 3px;
  }

  .theme-popover-content::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--primary) 50%, var(--text-primary) 20%);
  }

  .theme-category {
    position: sticky;
    top: 0;
    z-index: 10;
    background: color-mix(in srgb, var(--bg-color-accent) 85%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    font-weight: 700;
    color: var(--primary);
    padding: 0.75rem var(--element-px) 0.5rem var(--element-px);
    border-bottom: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
  }

  .theme-row-btn {
    margin: 0 var(--gap-sm);
    width: calc(100% - calc(var(--gap-sm) * 2));
    background: transparent;
    border: none;
    border-radius: 8px;
    padding: var(--gap-sm);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease-out;
    color: var(--text-primary);
    text-align: left;
  }

  .theme-row-btn:hover {
    background: color-mix(
      in srgb,
      var(--t-primary) 15%,
      color-mix(in srgb, var(--text-primary) 5%, transparent)
    );
    color: var(--text-primary);
    transform: translateX(4px);
  }

  .theme-row-btn.active {
    background: color-mix(
      in srgb,
      var(--t-primary) 20%,
      color-mix(in srgb, var(--text-primary) 8%, transparent)
    );
    color: var(--text-primary);
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .swatch-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    border: 2px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
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
    font-size: var(--text-base);
    font-family: var(--font-family);
  }
</style>
