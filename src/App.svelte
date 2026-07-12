<script>
  import { onMount } from "svelte";
  import "./app.css";
  import { fade } from "svelte/transition";
  import { formStore, sanitizeFormData } from "./store.js";

  import IntroBlock from "./blocks/IntroBlock.svelte";
  import FormatBlock from "./blocks/FormatBlock.svelte";
  import PersonalDataBlock from "./blocks/PersonalDataBlock.svelte";
  import TransportBlock from "./blocks/TransportBlock.svelte";
  import ProvisionsBlock from "./blocks/ProvisionsBlock.svelte";
  import AccommodationBlock from "./blocks/AccommodationBlock.svelte";
  import FreeMicBlock from "./blocks/FreeMicBlock.svelte";

  import SuccessScreen from "./components/SuccessScreen.svelte";
  import ClearModal from "./components/ClearModal.svelte";
  import HintBox from "./components/HintBox.svelte";
  import Header from "./components/Header.svelte";
  import NavigationButtons from "./components/NavigationButtons.svelte";

  let isSubmitted = false;
  /** @type {HTMLFormElement} */
  let formElement;
  let currentStep = 1;
  const totalSteps = 7;
  let headerHeight = 100;

  /** @type {any} */ let introBlock;
  /** @type {any} */ let formatBlock;
  /** @type {any} */ let personalDataBlock;
  /** @type {any} */ let transportBlock;
  /** @type {any} */ let provisionsBlock;
  /** @type {any} */ let accommodationBlock;
  /** @type {any} */ let freeMicBlock;

  /** @type {string[]} */
  let stepErrors = [];

  // Очищаем ошибки при любом изменении формы, чтобы кнопка возвращала свой обычный цвет
  $: {
    if ($formStore) {
      stepErrors = [];
    }
  }

  onMount(() => {
    // Dynamically calculate sticky header heights to prevent overlap bugs
    const updateHeaderHeights = () => {
      const bt = /** @type {HTMLElement} */ (
        document.querySelector(".block-title")
      );
      if (bt) {
        document.documentElement.style.setProperty(
          "--block-title-height",
          `${bt.offsetHeight}px`,
        );
      }
      const st = /** @type {HTMLElement} */ (
        document.querySelector(".section-title")
      );
      if (st) {
        document.documentElement.style.setProperty(
          "--section-title-height",
          `${st.offsetHeight}px`,
        );
      }
    };

    let lastWidth = 0;
    const observer = new ResizeObserver(() => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        updateHeaderHeights();
      }
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextStep() {
    /** @type {string[]} */
    let errors = [];
    if (currentStep === 2 && formatBlock && typeof formatBlock.validate === 'function') errors = formatBlock.validate();
    if (currentStep === 3 && personalDataBlock && typeof personalDataBlock.validate === 'function') errors = personalDataBlock.validate();
    if (currentStep === 4 && transportBlock && typeof transportBlock.validate === 'function') errors = transportBlock.validate();
    if (currentStep === 5 && provisionsBlock && typeof provisionsBlock.validate === 'function') errors = provisionsBlock.validate();
    if (currentStep === 6 && accommodationBlock && typeof accommodationBlock.validate === 'function') errors = accommodationBlock.validate();
    if (currentStep === 7 && freeMicBlock && typeof freeMicBlock.validate === 'function') errors = freeMicBlock.validate();

    if (formElement && !formElement.checkValidity()) {
      if (errors.length === 0) {
        errors.push("Некоторые обязательные поля не заполнены");
      }
    }

    stepErrors = errors;

    if (stepErrors.length > 0) return;

    if (currentStep < totalSteps) {
      currentStep++;
      stepErrors = [];
      scrollToTop();
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      stepErrors = [];
      scrollToTop();
    }
  }

  let showClearModal = false;

  $: {
    if (typeof document !== "undefined") {
      document.body.style.overflow = showClearModal ? "hidden" : "";
    }
  }

  function clearForm() {
    showClearModal = true;
  }

  function confirmClear() {
    formStore.reset();
    currentStep = 1;
    stepErrors = [];
    scrollToTop();
    showClearModal = false;
  }

  function cancelClear() {
    showClearModal = false;
  }

  function handleReset() {
    formStore.reset();
    isSubmitted = false;
    currentStep = 1;
  }

  const submitForm = () => {
    /** @type {string[]} */
    let errors = [];
    if (currentStep === 7 && freeMicBlock && typeof freeMicBlock.validate === 'function') errors = freeMicBlock.validate();
    
    if (formElement && !formElement.checkValidity()) {
      if (errors.length === 0) {
        errors.push("Некоторые обязательные поля не заполнены");
      }
    }

    stepErrors = errors;

    if (stepErrors.length > 0) return;

    const finalData = sanitizeFormData($formStore);
    console.log("Form Submitted", finalData);
    isSubmitted = true;
  };
</script>

<main id="app">
  <div class="app-transition-wrapper">
    {#if !isSubmitted}
      <form
        class="app-form"
        novalidate
        bind:this={formElement}
        on:submit|preventDefault={submitForm}
        transition:fade={{ duration: 300 }}
      >
        <Header bind:headerHeight {currentStep} {totalSteps} />

        <div class="app-body" style="--header-height: {headerHeight}px;">
          <!-- Wizard Steps Container -->
          <div class="step-container">
            {#if currentStep === 1}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <IntroBlock bind:this={introBlock} />
              </div>
            {:else if currentStep === 2}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <FormatBlock bind:this={formatBlock} />
              </div>
            {:else if currentStep === 3}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <PersonalDataBlock bind:this={personalDataBlock} />
              </div>
            {:else if currentStep === 4}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <TransportBlock bind:this={transportBlock} stepNumber={currentStep - 1} />
              </div>
            {:else if currentStep === 5}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <ProvisionsBlock bind:this={provisionsBlock} stepNumber={currentStep - 1} />
              </div>
            {:else if currentStep === 6}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <AccommodationBlock bind:this={accommodationBlock} />
              </div>
            {:else if currentStep === 7}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <FreeMicBlock bind:this={freeMicBlock} />
              </div>
            {/if}
          </div>
        </div>

        <!-- Navigation Buttons -->
        <NavigationButtons 
          {currentStep} 
          {totalSteps}
          hasErrors={stepErrors.length > 0}
          on:prev={prevStep} 
          on:next={nextStep} 
          on:clear={clearForm} 
        />
      </form>
    {:else}
      <!-- Success Screen -->
      <SuccessScreen on:reset={handleReset} />
    {/if}
  </div>

  {#if showClearModal}
    <ClearModal on:cancel={cancelClear} on:confirm={confirmClear} />
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
    min-height: 100vh;
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

  .app-body {
    flex: 1;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    padding: 1.5rem 1.5rem 6rem; /* Отступ снизу под фиксированный футер */
  }

  .step-container {
    display: grid;
    min-height: 400px;
  }

  .step-layer {
    grid-column: 1;
    grid-row: 1;
  }

  .app-transition-wrapper {
    display: grid;
    width: 100%;
    flex: 1;
  }

  .app-form {
    grid-area: 1 / 1;
    width: 100%;
  }

  @media (max-width: 600px) {
    .app-body {
      padding: 1rem 1rem 6rem;
    }
  }


</style>
