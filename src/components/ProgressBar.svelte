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
  <p class="step-indicator">Шаг {currentStep - 1} из {totalSteps - 1}</p>
</div>

<style>
  .progress-container {
    margin-bottom: 0.5rem;
    width: 100%;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.25rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--cyan));
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 15px var(--primary-glow);
  }

  .step-indicator {
    text-align: right;
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-family: var(--font-family);
  }

  @media (max-width: 600px) {
    .progress-container {
      margin-bottom: 0.5rem;
    }
  }
</style>
