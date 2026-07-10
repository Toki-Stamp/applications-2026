<script>
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  
  const themes = [
    { id: 'cyberpunk', name: 'Cyberpunk', primary: '#06b6d4', accent: '#6366f1' },
    { id: 'original', name: 'Neon Pink', primary: '#8b5cf6', accent: '#ec4899' },
    { id: 'mint', name: 'Mint', primary: '#10b981', accent: '#14b8a6' },
    { id: 'sunset', name: 'Sunset', primary: '#f97316', accent: '#f59e0b' },
    { id: 'ocean', name: 'Ocean', primary: '#3b82f6', accent: '#4f46e5' },
    { id: 'minimal', name: 'Minimal', primary: '#94a3b8', accent: '#e4e4e7' }
  ];
  
  let currentTheme = 'cyberpunk';
  let isOpen = false;
  let isHovered = false;
  
  onMount(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved && themes.some(t => t.id === saved)) {
      setTheme(saved);
    } else {
      setTheme('cyberpunk');
    }

    /** @param {MouseEvent} e */
    const closeListener = (e) => {
      if (e.target instanceof Element && !e.target.closest('.theme-switcher-wrapper')) {
        isOpen = false;
      }
    };
    document.addEventListener('click', closeListener);
    return () => document.removeEventListener('click', closeListener);
  });
  
  /** @param {string} id */
  function setTheme(id) {
    currentTheme = id;
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem('app-theme', id);
    isOpen = false;
  }
</script>

<div 
  class="theme-switcher-wrapper"
  role="presentation"
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => isHovered = false}
>
  <button 
    type="button"
    class="icon-btn" 
    on:click={() => isOpen = !isOpen}
    aria-label="Выбрать тему оформления"
  >
    <div class="swatch-circle" style="--t-primary: var(--primary); --t-accent: var(--accent);">
      <div class="color-half primary"></div>
      <div class="color-half accent"></div>
    </div>
  </button>

  {#if isHovered && !isOpen}
    <div class="custom-tooltip" transition:fade={{ duration: 150 }}>
      Настроить тему
    </div>
  {/if}

  {#if isOpen}
    <div class="theme-popover" transition:fade={{ duration: 150 }}>
      {#each themes as theme}
        <button 
          type="button"
          class="theme-row-btn" 
          class:active={currentTheme === theme.id}
          style="--t-primary: {theme.primary}; --t-accent: {theme.accent};"
          on:click={() => setTheme(theme.id)}
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
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    font-size: 1.5rem;
    cursor: pointer;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    padding: 0;
  }

  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  .theme-popover {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: rgba(18, 18, 20, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    min-width: 180px;
    z-index: 100;
  }

  .custom-tooltip {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: rgba(18, 18, 20, 0.95);
    color: var(--text-primary);
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.85rem;
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
    background: rgba(255, 255, 255, 0.05);
  }

  .theme-row-btn.active {
    background: rgba(255, 255, 255, 0.1);
    font-weight: 600;
  }

  .swatch-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .color-half {
    width: 100%;
    height: 50%;
  }
  
  .color-half.primary { background-color: var(--t-primary); }
  .color-half.accent { background-color: var(--t-accent); }

  .theme-name {
    font-size: 0.95rem;
    font-family: var(--font-family);
  }
</style>
