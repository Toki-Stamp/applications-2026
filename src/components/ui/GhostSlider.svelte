<script>
  /** 
   * @type {{ 
   *   value: number, 
   *   min?: number, 
   *   max?: number,
   *   showLabels?: boolean
   * }} 
   */
  let { 
    value = $bindable(0), 
    min = 0, 
    max = 100,
    showLabels = false
  } = $props();

  let percentage = $derived(Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)));
</script>

<div class="ghost-slider-container" class:no-labels={!showLabels}>
  {#if showLabels}
    <div class="scale-label mono">{min}</div>
  {/if}
  
  <div class="slider-with-marks-wrap flex-1" style="--val-percent: {percentage}%;">
    
    <!-- Tooltip -->
    <div class="floating-tooltip mono" style="left: calc({percentage}% + 10px - ({percentage} / 100 * 20px));">
      {value}%
    </div>

    <!-- Track -->
    <div class="ghost-track"></div>
    
    <!-- Input -->
    <input type="range" class="pro-range w-full relative-range" {min} {max} bind:value />
  </div>
  
  {#if showLabels}
    <div class="scale-label mono">{max}</div>
  {/if}
</div>

<style>
  .ghost-slider-container {
    display: flex; align-items: center; gap: 24px; width: 100%; position: relative; padding-top: 16px;
  }
  
  .scale-label {
    opacity: 0.4; font-size: var(--text-sm, 14px); font-weight: 600; user-select: none; letter-spacing: 0.05em; font-family: var(--font-family, inherit); color: var(--text-primary, #fff); width: 28px; text-align: center;
  }
  
  .mono { font-family: var(--font-family, inherit); }
  .flex-1 { flex: 1; min-width: 0; }
  
  .slider-with-marks-wrap { 
    position: relative; padding: 16px 0; display: flex; align-items: center; width: 100%; 
  }
  
  /* ================= FINAL TRACK ================= */
  .ghost-track {
    position: absolute; left: 14px; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;
    height: 1px;
    background: var(--text-secondary);
    opacity: 0.3; 
    box-shadow: none; 
  }
  
  .ghost-track::after {
    content: ''; position: absolute; left: 0; top: -2px; 
    height: 5px; 
    background: linear-gradient(90deg, var(--accent) 0%, var(--primary) 100%);
    width: var(--val-percent, 0%);
    border-radius: 5px;
    box-shadow: 
      0 0 6px var(--primary), 
      0 0 20px var(--primary-glow);
    transition: width 0.05s linear;
  }

  /* ================= FINAL THUMB ================= */
  .pro-range {
    position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%);
    -webkit-appearance: none; appearance: none; height: 40px; background: transparent !important; margin: 0; outline: none; z-index: 5; cursor: pointer; width: 100%;
  }
  
  .pro-range::-webkit-slider-thumb {
    -webkit-appearance: none; 
    cursor: pointer; 
    position: relative;
    z-index: 6;
    
    /* Frost Glass + Primary Ring (Softened) */
    width: 20px; 
    height: 20px; 
    border-radius: 50%; 
    /* Используем системное темное стекло с легчайшей примесью праймари, чтобы избежать эффекта "грязного серого пластика" на темных фонах */
    background: color-mix(in srgb, var(--glass-bg) 85%, var(--primary) 15%); 
    backdrop-filter: blur(12px); 
    -webkit-backdrop-filter: blur(12px);
    
    /* Смягчаем жесткую границу за счет полупрозрачности */
    border: 1.5px solid color-mix(in srgb, var(--primary) 50%, transparent); 
    
    /* Убираем резкую черную тень и добавляем мягкое свечение в тон кольца */
    box-shadow: 
      0 0 10px var(--primary-glow),
      0 2px 8px rgba(0,0,0,0.2);
  }
  
  /* ================= FINAL TOOLTIP ================= */
  .floating-tooltip {
    position: absolute; pointer-events: none; transition: left 0.05s linear; z-index: 10; transform: translateX(-50%);
    top: -24px; 
    font-size: var(--text-sm, 14px); 
    font-weight: 500; 
    color: var(--text-secondary); 
    text-shadow: none;
  }
</style>
