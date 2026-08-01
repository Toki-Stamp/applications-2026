<script>
  import { fade } from "svelte/transition";
  import Button from "$shared/components/ui/Button.svelte";
  import RichText from "$shared/components/ui/RichText.svelte";
  import { dict } from "$shared/locales/ru.js";

  let { onreset } = $props();
</script>

<div class="success-container" transition:fade={{ duration: 300 }}>
  <div class="block-card success-screen">
    <div class="success-icon">🎉</div>
    <h2 class="success-title">{dict.steps.outro.title}</h2>
    <div class="success-text">
      {#each dict.steps.outro.body as p}
        <p><RichText content={p} /></p>
      {/each}
    </div>
  </div>
</div>

<style>
  .success-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1;
  }

  .success-screen {
    text-align: center;
    padding: calc(var(--layout-py-base) * 2) var(--layout-px-base);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .success-icon {
    font-size: var(--text-hero);
    line-height: var(--line-height-none);
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.4));
    display: inline-block;
    animation:
      float 3s ease-in-out infinite,
      glow 2s ease-in-out infinite alternate;
    text-shadow: 0 0 20px var(--primary-glow);
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-15px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  @keyframes glow {
    0% {
      filter: drop-shadow(0 0 10px var(--primary));
    }
    100% {
      filter: drop-shadow(0 0 25px var(--accent));
    }
  }

  .success-title {
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
  }

  .success-text {
    color: var(--text-primary);
    line-height: var(--line-height-relaxed);
    margin-bottom: 2.5rem;
    /* max-width: var(--max-width); */
    font-size: var(--text-xl);
    font-weight: var(--font-weight-normal);
  }

  .success-text p {
    margin: 0 0 var(--gap-sm) 0;
  }

  @media (max-width: 600px) {
    .success-screen {
      padding: var(--layout-py-base) var(--layout-px-base);
    }
  }
</style>
