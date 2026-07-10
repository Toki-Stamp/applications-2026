<script>
  import { tick, onMount } from "svelte";
  import "./app.css";
  import { slide, fade } from "svelte/transition";
  import { formStore, sanitizeFormData } from "./store.js";

  import IntroBlock from "./blocks/IntroBlock.svelte";
  import FormatBlock from "./blocks/FormatBlock.svelte";
  import PersonalDataBlock from "./blocks/PersonalDataBlock.svelte";
  import TransportBlock from "./blocks/TransportBlock.svelte";
  import ProvisionsBlock from "./blocks/ProvisionsBlock.svelte";
  import AccommodationBlock from "./blocks/AccommodationBlock.svelte";
  import TextArea from "./components/TextArea.svelte";
  import ThemeSwitcher from "./components/ThemeSwitcher.svelte";

  let isSubmitted = false;
  /** @type {HTMLFormElement} */
  let formElement;
  let currentStep = 1;
  const totalSteps = 7;
  let headerHeight = 100;

  onMount(() => {
    // Dynamically calculate sticky header heights to prevent overlap bugs
    const updateHeaderHeights = () => {
      const bt = /** @type {HTMLElement} */ (document.querySelector('.block-title'));
      if (bt) {
        document.documentElement.style.setProperty('--block-title-height', `${bt.offsetHeight}px`);
      }
      const st = /** @type {HTMLElement} */ (document.querySelector('.section-title'));
      if (st) {
        document.documentElement.style.setProperty('--section-title-height', `${st.offsetHeight}px`);
      }
    };
    
    const observer = new ResizeObserver(updateHeaderHeights);
    observer.observe(document.body);
    
    return () => {
      observer.disconnect();
    };
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextStep() {
    // Validation removed as requested
    if (currentStep < totalSteps) {
      currentStep++;
      scrollToTop();
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      scrollToTop();
    }
  }

  function clearForm() {
    if (confirm("Вы уверены, что хотите стереть все введенные данные?")) {
      formStore.reset();
      currentStep = 1;
      scrollToTop();
    }
  }

  const submitForm = () => {
    const finalData = sanitizeFormData($formStore);
    console.log("Form Submitted", finalData);
    isSubmitted = true;
  };
</script>

<main id="app">
  {#if !isSubmitted}
    <form
      class="app-form"
      bind:this={formElement}
      on:submit|preventDefault={submitForm}
    >
      <header class="app-header" bind:clientHeight={headerHeight}>
        <div class="header-content">
          <div class="header-top-row">
            <div class="title-container">
              <h1>Заявка 2026</h1>
            </div>
            <div class="theme-switcher-container">
              <ThemeSwitcher />
            </div>
          </div>

          {#if currentStep > 1}
            <div class="progress-container">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {((currentStep - 1) / (totalSteps - 1)) * 100}%"
                ></div>
              </div>
              <p class="step-indicator">
                Шаг {currentStep - 1} из {totalSteps - 1}
              </p>
            </div>
          {/if}
        </div>
      </header>

      <div class="app-body" style="--header-height: {headerHeight}px;">
        <!-- Wizard Steps Container -->
        <div class="step-container">
          {#if currentStep === 1}
            <div transition:fade={{ duration: 300 }} class="step-layer">
              <IntroBlock />
            </div>
          {:else if currentStep === 2}
            <div transition:fade={{ duration: 300 }} class="step-layer">
              <FormatBlock />
            </div>
          {:else if currentStep === 3}
            <div transition:fade={{ duration: 300 }} class="step-layer">
              <PersonalDataBlock stepNumber={currentStep - 1} />
            </div>
          {:else if currentStep === 4}
            <div transition:fade={{ duration: 300 }} class="step-layer">
              <TransportBlock stepNumber={currentStep - 1} />
            </div>
          {:else if currentStep === 5}
            <div transition:fade={{ duration: 300 }} class="step-layer">
              <ProvisionsBlock stepNumber={currentStep - 1} />
            </div>
          {:else if currentStep === 6}
            <div transition:fade={{ duration: 300 }} class="step-layer">
              <AccommodationBlock />
            </div>
          {:else if currentStep === 7}
            <div transition:fade={{ duration: 300 }} class="step-layer">
              <div class="block-card">
                  Свободный микрофон
                <TextArea
                  label="Комментарий или пожелания организаторам"
                  placeholder="Напишите здесь всё, что считаете важным..."
                  bind:value={$formStore.freeMic}
                />
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Navigation Buttons -->
      <footer class="app-footer">
        <div class="footer-content">
          <div class="navigation-buttons">
            <div class="left-buttons">
              {#if currentStep > 1}
                <button type="button" class="btn-danger" on:click={clearForm}>
                  Очистить форму
                </button>
              {/if}
            </div>
            <div class="right-buttons">
              {#if currentStep > 1}
                <button type="button" class="btn-secondary" on:click={prevStep}>
                  Назад
                </button>
              {/if}

              {#if currentStep < totalSteps}
                <button type="button" class="btn-primary" on:click={nextStep}>
                  {currentStep === 1 ? "Начать заполнение" : "Далее"}
                </button>
              {:else}
                <button type="submit" class="btn-submit"
                  >Отправить заявку</button
                >
              {/if}
            </div>
          </div>
        </div>
      </footer>
    </form>
  {:else}
    <!-- Success Screen -->
    <div class="success-container" transition:slide>
      <div class="block-card success-screen">
        <div class="success-icon">🎉</div>
        <h2>Ваша заявка принята!</h2>
        <p class="success-text">
          Организаторы обработают данные, рассчитают итоговую сумму (оргвзнос +
          проживание + питание + проезд) и свяжутся с вами по указанному
          контакту для подтверждения.
        </p>
        <button
          class="btn-submit mt-4"
          on:click={() => {
            formStore.reset();
            isSubmitted = false;
            currentStep = 1;
          }}>Отправить еще одну заявку</button
        >
      </div>
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: var(--bg-color);
  }

  :global(#app) {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding: 0 !important;
    max-width: 100% !important;
    width: 100%;
  }

  .app-form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .app-header {
    position: sticky;
    top: 0;
    width: 100%;
    background: rgba(9, 9, 11, 0.7);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    z-index: 50;
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem 1.5rem 0.5rem;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .header-top-row {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .theme-switcher-container {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .app-body {
    flex: 1;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    padding: 1.5rem;
  }

  .app-footer {
    position: sticky;
    bottom: 0;
    width: 100%;
    background: rgba(9, 9, 11, 0.7);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    z-index: 50;
    border-top: 1px solid var(--border-color);
    box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.2);
  }

  .footer-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
  }

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

  h1 {
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, var(--text-primary) 20%, var(--primary) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 5px var(--primary-glow));
  }

  .step-indicator {
    text-align: right;
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-family: var(--font-family);
  }

  .step-container {
    display: grid;
    min-height: 400px;
    margin-bottom: 2rem;
  }

  .step-layer {
    grid-column: 1;
    grid-row: 1;
  }

  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .left-buttons,
  .right-buttons {
    display: flex;
    gap: 1rem;
  }

  .right-buttons {
    flex: 1;
    justify-content: flex-end;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    padding: 0.8rem 1.5rem;
    font-size: 0.95rem;
    font-weight: 700;
    font-family: var(--font-family);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  .btn-primary {
    color: white;
    background: linear-gradient(135deg, var(--primary), var(--cyan));
    border: none;
    box-shadow: 0 4px 15px var(--primary-glow);
    flex-grow: 1;
  }
  
  .btn-primary::before {
    content: "";
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%);
    z-index: -1;
    transition: opacity 0.4s ease;
    opacity: 0;
  }

  .btn-primary:hover {
    box-shadow: 0 8px 25px var(--primary-glow);
    transform: translateY(-2px) scale(1.01);
  }
  
  .btn-primary:hover::before {
    opacity: 1;
  }

  .btn-secondary {
    color: var(--text-primary);
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    min-width: 150px;
  }

  .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: var(--glass-border-hover);
  }

  .btn-danger {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .btn-danger:hover {
    background-color: rgba(239, 68, 68, 0.2);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
  }

  .success-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  @media (max-width: 600px) {
    .header-content,
    .footer-content {
      padding: 0.5rem 1rem;
    }

    .app-body,
    .success-container {
      padding: 1rem;
    }
    
    .progress-container {
      margin-bottom: 0.5rem;
    }

    .navigation-buttons {
      flex-direction: column-reverse;
      gap: 0.5rem;
    }

    .btn-primary,
    .btn-secondary,
    .btn-danger {
      padding: 0.75rem 1rem;
    }

    .left-buttons,
    .right-buttons {
      width: 100%;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-secondary,
    .btn-danger {
      width: 100%;
    }
  }
</style>
