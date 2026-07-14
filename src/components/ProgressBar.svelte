<script>
  let { currentStep, totalSteps } = $props();
</script>

<div class="progress-container">
  <div class="step-indicator">Шаг {currentStep - 1} из {totalSteps - 1}</div>
  <div class="progress-bar">
    <div
      class="progress-fill"
      style="width: {((currentStep - 1) / (totalSteps - 1)) * 100}%"
    ></div>
  </div>
</div>

<style>
  .progress-container {
    width: 100%;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .step-indicator {
    text-align: center;
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-family: var(--font-family);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--cyan));
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px var(--primary-glow);
  }
</style>
