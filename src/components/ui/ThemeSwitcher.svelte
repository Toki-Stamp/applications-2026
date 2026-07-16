<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  const darkThemes = [
    {
      id: "cyberpunk",
      name: "Cyberpunk",
      primary: "#06b6d4",
      accent: "#6366f1",
    },
    {
      id: "original",
      name: "Neon Pink",
      primary: "#8b5cf6",
      accent: "#ec4899",
    },
    { id: "mint", name: "Mint", primary: "#10b981", accent: "#14b8a6" },
    { id: "sunset", name: "Sunset", primary: "#f97316", accent: "#f59e0b" },
    { id: "ocean", name: "Ocean", primary: "#3b82f6", accent: "#4f46e5" },
    { id: "minimal", name: "Minimal", primary: "#94a3b8", accent: "#e4e4e7" },
    { id: "military", name: "Military", primary: "#858f6b", accent: "#5c6348" },
    { id: "galaxy", name: "Galaxy", primary: "#a855f7", accent: "#6366f1" },
    {
      id: "marshmallow",
      name: "Marshmallow",
      primary: "#fda4af",
      accent: "#fbcfe8",
    },
    { id: "lava", name: "Lava", primary: "#ef4444", accent: "#f97316" },
  ];

  const lightThemes = [
    {
      id: "light-daylight",
      name: "Daylight",
      primary: "#0ea5e9",
      accent: "#4f46e5",
    },
    {
      id: "light-cotton",
      name: "Cotton",
      primary: "#a855f7",
      accent: "#ec4899",
    },
    {
      id: "light-sunrise",
      name: "Sunrise",
      primary: "#f97316",
      accent: "#f59e0b",
    },
    { id: "light-mint", name: "Mint", primary: "#10b981", accent: "#0d9488" },
    {
      id: "light-sakura",
      name: "Sakura",
      primary: "#f43f5e",
      accent: "#e11d48",
    },
    { id: "light-lemon", name: "Lemon", primary: "#eab308", accent: "#d97706" },
    {
      id: "light-lavender",
      name: "Lavender",
      primary: "#8b5cf6",
      accent: "#6d28d9",
    },
    { id: "light-sand", name: "Sand", primary: "#b45309", accent: "#92400e" },
    {
      id: "light-military",
      name: "Military",
      primary: "#4a5d23",
      accent: "#3b4a1c",
    },
    { id: "light-ocean", name: "Ocean", primary: "#0284c7", accent: "#0369a1" },
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
        primary: computed.getPropertyValue("--primary").trim() || theme.primary,
        accent: computed.getPropertyValue("--accent").trim() || theme.accent,
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
    <div class="custom-tooltip" in:fade={{ duration: 150 }} out:fade={{ duration: isOpen ? 0 : 150 }}>
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
          style="--t-primary: {computedColors[theme.id]?.primary || theme.primary}; --t-accent: {computedColors[theme.id]?.accent || theme.accent};"
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
          style="--t-primary: {computedColors[theme.id]?.primary || theme.primary}; --t-accent: {computedColors[theme.id]?.accent || theme.accent};"
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
    font-size: 1.5rem;
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
    padding: 0 0 0.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    color: var(--text-secondary);
    padding: 0.75rem 1rem 0.25rem 1rem;
    border-bottom: 1px solid
      color-mix(in srgb, var(--text-primary) 10%, transparent);
  }

  .custom-tooltip {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    background: color-mix(in srgb, var(--bg-color-accent) 95%, transparent);
    color: var(--text-primary);
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: normal;
    font-family: var(--font-family);
    text-transform: uppercase;
    letter-spacing: 1px;
    white-space: nowrap;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    z-index: 1000;
    pointer-events: none;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .theme-row-btn {
    margin: 0 0.5rem;
    width: calc(100% - 1rem);
    background: transparent;
    border: none;
    border-radius: 8px;
    padding: 0.5rem;
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
    font-weight: 600;
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
    font-size: 0.95rem;
    font-family: var(--font-family);
  }
</style>
