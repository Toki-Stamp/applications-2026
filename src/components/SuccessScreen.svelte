<script>
  import { fade } from "svelte/transition";

  let { onreset } = $props();
</script>

<div class="success-container" transition:fade={{ duration: 300 }}>
  <div class="block-card success-screen">
    <div class="success-icon">🎉</div>
    <h2 class="success-title">Ваша заявка принята!</h2>
    <p class="success-text">
      Да прибудет с Вами сила зубра!<br />
      А теперь степенно ожидайте дня сходки...
    </p>
    <button
      type="button"
      class="btn-primary mt-1"
      onclick={onreset}
    >
      Заполнить новую заявку
    </button>
  </div>
</div>

<style>
  .success-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    grid-area: 1 / 1;
    width: 100%;
  }

  .success-screen {
    text-align: center;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .success-icon {
    font-size: 4.5rem;
    line-height: 1;
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.4));
  }

  .success-title {
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
  }

  .success-text {
    font-family: monospace, var(--font-family);
    color: var(--text-primary);
    line-height: 1.6;
    margin-bottom: 2.5rem;
    max-width: 600px;
    font-size: 1.15rem;
  }

  .mt-1 {
    margin-top: 1rem;
  }

  @media (max-width: 600px) {
    .success-container {
      padding: 1rem;
    }
  }
</style>
