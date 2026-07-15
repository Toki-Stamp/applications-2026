<script>
  import { fade } from "svelte/transition";
  import Button from "../ui/Button.svelte";

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
    <Button
      variant="primary"
      class="mt-1"
      onclick={onreset}
    >
      Заполнить новую заявку
    </Button>
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
    font-size: 5rem;
    line-height: 1;
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.4));
    display: inline-block;
    animation: float 3s ease-in-out infinite, glow 2s ease-in-out infinite alternate;
    text-shadow: 0 0 20px var(--primary-glow);
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }

  @keyframes glow {
    0% { filter: drop-shadow(0 0 10px var(--primary)); }
    100% { filter: drop-shadow(0 0 25px var(--accent)); }
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



  @media (max-width: 600px) {
    .success-container {
      padding: 1rem;
    }
  }
</style>
