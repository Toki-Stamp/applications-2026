<script>
  let { currentStep, totalSteps } = $props();
</script>

<div class="progress-container">
  <div class="progress-bar">
    <div
      class="progress-fill"
      style="width: {((currentStep - 1) / (totalSteps - 1)) * 100}%"
    ></div>
  </div>
  <div class="step-indicator">Шаг {currentStep - 1} из {totalSteps - 1}</div>
</div>

<style>
  .progress-container {
    position: relative;
    width: 100%;
    margin-bottom: 1.5rem;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .progress-bar {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
    overflow: hidden;
    z-index: 1;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--cyan));
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px var(--primary-glow);
  }

  .step-indicator {
    position: relative;
    z-index: 2;
    background: var(--bg-color-accent); /* pill background to cut the line */
    padding: 2px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: var(--font-family);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }
</style>
