<script>
  let { currentStep, totalSteps } = $props();
</script>

<div class="progress-wrapper">
  <div class="progress-bar-bottom">
    <div
      class="progress-fill"
      style="width: {((currentStep - 1) / (totalSteps - 1)) * 100}%"
    ></div>
  </div>
</div>

<style>
  .progress-wrapper {
    width: 100%;
  }

  .progress-bar-bottom {
    position: absolute;
    bottom: -1px; /* Оверлеп на нижний бордер хедера */
    left: 0;
    width: 100%;
    height: 3px;
    background-color: transparent;
    z-index: 10;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--cyan));
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 8px var(--primary-glow);
  }
</style>
