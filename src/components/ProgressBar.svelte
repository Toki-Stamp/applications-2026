<script>
  let { currentStep, totalSteps } = $props();
</script>

<div class="progress-container">
  <div class="progress-bar">
    <div
      class="progress-fill"
      style="width: {((currentStep - 1) / (totalSteps - 1)) * 100}%"
    ></div>
    <div class="progress-text">Шаг {currentStep - 1} из {totalSteps - 1}</div>
  </div>
</div>

<style>
  .progress-container {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .progress-bar {
    position: relative;
    width: 100%;
    height: 20px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--cyan));
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-text {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: var(--font-family);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }
</style>
