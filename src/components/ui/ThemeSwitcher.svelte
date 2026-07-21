<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

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
  let isHovered = $state(false);

  // Store computed colors to dynamically match themes.css
  /** @type {Record<string, {primary: string, accent: string}>} */
  let computedColors = $state({});

  onMount(() => {
    // Dynamically fetch actual CSS variables for each theme
    // by temporarily applying them to the root. Since it's synchronous,
    // the browser won't paint the intermediate states.
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

    /** @param {MouseEvent} e */
    const closeListener = (e) => {
      if (
        e.target instanceof Element &&
        !e.target.closest(".theme-switcher-wrapper")
      ) {
        isOpen = false;
      }
    };
    document.addEventListener("click", closeListener);
    return () => document.removeEventListener("click", closeListener);
  });

  /** @param {string} id */
  function setTheme(id) {
    currentTheme = id;
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("app-theme", id);
    isOpen = false;
  }
</script>

<div
  class="theme-switcher-wrapper"
  role="presentation"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  <button
    type="button"
    class="icon-btn"
    onclick={() => (isOpen = !isOpen)}
    aria-label="Выбрать тему оформления"
  >
    <md-icon>settings</md-icon>
  </button>

  {#if isHovered && !isOpen}
    <div
      class="custom-tooltip"
      in:fade={{ duration: 150 }}
      out:fade={{ duration: isOpen ? 0 : 150 }}
    >
      Настроить тему
    </div>
  {/if}

  {#if isOpen}
    <div class="theme-popover" transition:fade={{ duration: 150 }}>
      <div class="theme-category">Тёмные темы</div>
      {#each darkThemes as theme}
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
      {/each}

      <div class="theme-category">Светлые темы</div>
      {#each lightThemes as theme}
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
      {/each}
    </div>
  {/if}
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

  .theme-popover {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    background: color-mix(in srgb, var(--bg-color-accent) 95%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 0 0 var(--gap-sm) 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    width: 220px;
    max-height: 260px;
    overflow-y: auto;
    z-index: 100;
  }

  .theme-popover::-webkit-scrollbar {
    width: 6px;
  }

  .theme-popover::-webkit-scrollbar-track {
    background: transparent;
  }

  .theme-popover::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--text-primary) 20%, transparent);
    border-radius: 3px;
  }

  .theme-popover::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--text-primary) 30%, transparent);
  }

  .theme-category {
    position: sticky;
    top: 0;
    z-index: 10;
    background: color-mix(in srgb, var(--bg-color-accent) 95%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: var(--font-weight-bold);
    color: var(--text-secondary);
    padding: 0.75rem var(--element-px) var(--gap-xs) var(--element-px);
    border-bottom: 1px solid
      color-mix(in srgb, var(--text-primary) 10%, transparent);
  }

  .custom-tooltip {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    background: color-mix(in srgb, var(--bg-color-accent) 95%, transparent);
    color: var(--text-primary) !important;
    padding: calc(var(--gap-sm) * 1.2) calc(var(--gap-fields) * 0.8);
    border-radius: 8px;
    font-size: var(--text-sm);
    font-weight: var(--font-weight-normal);
    font-family: var(--font-family);
    text-transform: uppercase;
    letter-spacing: 1px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    white-space: nowrap;
    border: 1px solid color-mix(in srgb, var(--primary-color, var(--primary)) 40%, var(--border-color));
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    z-index: 1000;
    pointer-events: none;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
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
    transition: background 0.2s;
    color: var(--text-primary);
    text-align: left;
  }

  .theme-row-btn:hover {
    background: color-mix(in srgb, var(--text-primary) 5%, transparent);
  }

  .theme-row-btn.active {
    background: color-mix(in srgb, var(--text-primary) 10%, transparent);
    font-weight: var(--font-weight-semibold);
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
