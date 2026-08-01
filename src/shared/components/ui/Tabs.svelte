<script>
  import { onMount } from "svelte";

  /**
   * @typedef {Object} Tab
   * @property {string} id
   * @property {string} label
   * @property {string} [icon]
   * @property {number} [count]
   */

  /**
   * @typedef {Object} Props
   * @property {Tab[]} tabs
   * @property {string} activeTab
   * @property {boolean} [fullWidth=false]
   */

  /** @type {Props} */
  let { tabs = [], activeTab = $bindable(""), fullWidth = false } = $props();

  let btnRefs = $state([]);
  let sliderStyle = $state("");

  $effect(() => {
    if (!activeTab && tabs.length > 0) {
      activeTab = tabs[0].id;
    }
  });

  // Calculate sliding pill position
  function updateSlider() {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const activeBtn = btnRefs[activeIndex];
    if (activeBtn) {
      const left = activeBtn.offsetLeft;
      const width = activeBtn.offsetWidth;
      sliderStyle = `transform: translateX(${left}px); width: ${width}px;`;
    }
  }

  $effect(() => {
    activeTab; // depend on activeTab
    // Use setTimeout or requestAnimationFrame to ensure DOM is updated and layout is calculated
    setTimeout(updateSlider, 0);
  });
  
  onMount(() => {
    // Initial calculation and listener
    setTimeout(updateSlider, 50);
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  });
</script>

<div class="tabs-container" class:full-width={fullWidth}>
  <div class="tabs-list">
    <!-- Animated sliding pill -->
    <div class="slider" style={sliderStyle}></div>

    {#each tabs as tab, i}
      <button
        bind:this={btnRefs[i]}
        class="tab-btn"
        class:active={activeTab === tab.id}
        onclick={() => (activeTab = tab.id)}
        aria-selected={activeTab === tab.id}
        role="tab"
      >
        <div class="tab-content">
          {#if tab.icon}
            <md-icon class="tab-icon">{tab.icon}</md-icon>
          {/if}
          <span class="tab-label">{tab.label}</span>
          {#if tab.count !== undefined}
            <span class="tab-badge">{tab.count}</span>
          {/if}
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .tabs-container {
    width: 100%;
    margin-bottom: var(--gap-section);
  }

  .tabs-list {
    position: relative;
    display: flex;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-full);
    padding: 6px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: var(--shadow-sm);
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .tabs-list::-webkit-scrollbar {
    display: none;
  }

  /* The Sliding Pill */
  .slider {
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: 0;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--primary) 0%, var(--cyan) 100%);
    box-shadow: 0 4px 12px var(--primary-glow);
    /* Spring-like transition for premium feel */
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
    z-index: 1;
  }

  /* Inner glow for the slider */
  .slider::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  .full-width .tabs-list {
    width: 100%;
  }

  .full-width .tab-btn {
    flex: 1;
  }

  .tab-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    border: none;
    background: transparent;
    border-radius: var(--radius-full);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family);
    cursor: pointer;
    transition: color 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    outline: none;
    z-index: 2; /* Ensure text is above the slider */
  }

  .tab-btn:hover:not(.active) {
    color: var(--text-primary);
  }

  .tab-btn.active {
    color: var(--btn-primary-text);
    /* Slightly increase text weight or shadow on active */
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  .tab-content {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }

  .tab-icon {
    font-size: var(--text-lg);
    --md-icon-size: var(--text-lg);
  }

  .tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--text-primary) 15%, transparent);
    color: currentColor;
    font-size: 11px;
    font-weight: var(--font-weight-bold);
    padding: 2px 6px;
    border-radius: var(--radius-full);
    min-width: 20px;
    transition: background 0.3s;
  }

  .tab-btn.active .tab-badge {
    background: rgba(255, 255, 255, 0.25);
  }

  /* --- Mobile: Floating Bottom Bar --- */
  @media (max-width: 600px) {
    .tabs-container {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 32px); /* 16px padding on sides */
      margin-bottom: 0;
      z-index: 100;
    }

    .tabs-list {
      padding: 4px;
      /* Stronger blur and darker background for floating island */
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      background: rgba(24, 24, 27, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    }
    
    .slider {
      top: 4px;
      bottom: 4px;
    }

    .tab-btn {
      padding: 8px 6px;
      flex-direction: column;
      gap: 4px;
    }
    
    .tab-content {
      flex-direction: column;
      gap: 4px;
    }
    
    .tab-icon {
      font-size: 24px;
      --md-icon-size: 24px;
    }

    .tab-badge {
      position: absolute;
      top: -4px;
      right: -8px;
      font-size: 9px;
      padding: 1px 4px;
      min-width: 16px;
    }
    
    .tab-label {
      font-size: 10px;
      letter-spacing: 0.02em;
      font-weight: var(--font-weight-semibold);
    }
  }
</style>
