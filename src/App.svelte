<script>
  import { onMount } from "svelte";
  import "./app.css";
  import { fade } from "svelte/transition";
  import { formStore, sanitizeFormData } from "./store.js";
  import { GOOGLE_SCRIPT_URL } from "./constants.js";

  import IntroBlock from "./blocks/IntroBlock.svelte";
  import FormatBlock from "./blocks/FormatBlock.svelte";
  import PersonalDataBlock from "./blocks/PersonalDataBlock.svelte";
  import TransportBlock from "./blocks/TransportBlock.svelte";
  import ProvisionsBlock from "./blocks/ProvisionsBlock.svelte";
  import AccommodationBlock from "./blocks/AccommodationBlock.svelte";
  import FreeMicBlock from "./blocks/FreeMicBlock.svelte";

  import SuccessScreen from "./components/SuccessScreen.svelte";
  import Modal from "./components/Modal.svelte";
  import Header from "./components/Header.svelte";
  import NavigationButtons from "./components/NavigationButtons.svelte";

  let isSubmitted = false;
  let isSubmitting = false;
  /** @type {HTMLFormElement} */
  let formElement;
  let currentStep = 1;
  const totalSteps = 7;
  let headerHeight = 100;

  /** @type {any} */ let formatBlock;
  /** @type {any} */ let personalDataBlock;
  /** @type {any} */ let transportBlock;
  /** @type {any} */ let provisionsBlock;
  /** @type {any} */ let accommodationBlock;
  /** @type {any} */ let freeMicBlock;

  /** @type {string[]} */
  let stepErrors = [];
  let showClearModal = false;
  /** @type {string | null} */
  let submitErrorMessage = null; // Хранит текст ошибки отправки

  // Очищаем ошибки при любом изменении формы, чтобы кнопка возвращала свой обычный цвет
  $: {
    if ($formStore) {
      stepErrors = [];
    }
  }

  $: {
    if (typeof document !== "undefined") {
      document.body.style.overflow =
        showClearModal || submitErrorMessage ? "hidden" : "";
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
    if (
      currentStep === 2 &&
      formatBlock &&
      typeof formatBlock.validate === "function"
    )
      errors = formatBlock.validate();
    if (
      currentStep === 3 &&
      personalDataBlock &&
      typeof personalDataBlock.validate === "function"
    )
      errors = personalDataBlock.validate();
    if (
      currentStep === 4 &&
      transportBlock &&
      typeof transportBlock.validate === "function"
    )
      errors = transportBlock.validate();
    if (
      currentStep === 5 &&
      provisionsBlock &&
      typeof provisionsBlock.validate === "function"
    )
      errors = provisionsBlock.validate();
    if (
      currentStep === 6 &&
      accommodationBlock &&
      typeof accommodationBlock.validate === "function"
    )
      errors = accommodationBlock.validate();
    if (
      currentStep === 7 &&
      freeMicBlock &&
      typeof freeMicBlock.validate === "function"
    )
      errors = freeMicBlock.validate();

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

  function clearForm() {
    formStore.reset();
    currentStep = 1;
    stepErrors = [];
    showClearModal = false;
    scrollToTop();
  }

  function handleReset() {
    formStore.reset();
    isSubmitted = false;
    currentStep = 1;
  }

  const submitForm = async () => {
    if (isSubmitting) return;

    /** @type {string[]} */
    let errors = [];
    if (
      currentStep === 7 &&
      freeMicBlock &&
      typeof freeMicBlock.validate === "function"
    )
      errors = freeMicBlock.validate();

    if (formElement && !formElement.checkValidity()) {
      if (errors.length === 0) {
        errors.push("Некоторые обязательные поля не заполнены");
      }
    }

    stepErrors = errors;

    if (stepErrors.length > 0) return;

    const finalData = sanitizeFormData($formStore);
    isSubmitting = true;

    try {
      console.log("Submitting payload to Google Apps Script:", finalData);

      if (!GOOGLE_SCRIPT_URL) {
        throw new Error("GOOGLE_SCRIPT_URL не задан в constants.js");
      }

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const result = await response.json();
      if (result.result === "error") {
        throw new Error(
          result.error || "Неизвестная ошибка на стороне сервера",
        );
      }

      isSubmitted = true;
    } catch (e) {
      const error = /** @type {Error} */ (e);
      console.error("Error submitting form:", error);
      submitErrorMessage = error.message;
    } finally {
      isSubmitting = false;
    }
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
                <IntroBlock />
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
                <TransportBlock
                  bind:this={transportBlock}
                  stepNumber={currentStep - 1}
                />
              </div>
            {:else if currentStep === 5}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <ProvisionsBlock
                  bind:this={provisionsBlock}
                  stepNumber={currentStep - 1}
                />
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
          {isSubmitting}
          on:prev={prevStep}
          on:next={nextStep}
          on:clear={() => (showClearModal = true)}
        />
      </form>
    {:else}
      <!-- Success Screen -->
      <SuccessScreen on:reset={handleReset} />
    {/if}
  </div>

  {#if showClearModal}
    <Modal on:close={() => (showClearModal = false)}>
      <h2 slot="header" class="block-title">Очистить форму?</h2>
      <p>Вы уверены, что хотите безвозвратно удалить все введенные данные?</p>
      <svelte:fragment slot="actions">
        <button
          type="button"
          class="btn-secondary"
          on:click={() => (showClearModal = false)}>Отмена</button
        >
        <button type="button" class="btn-danger" on:click={clearForm}
          >Очистить</button
        >
      </svelte:fragment>
    </Modal>
  {/if}

  {#if submitErrorMessage}
    <Modal variant="danger" on:close={() => (submitErrorMessage = null)}>
      <h2 slot="header" class="block-title">Ошибка отправки формы</h2>
      <p>Причина: <strong class="text-primary">{submitErrorMessage}</strong></p>
      <p style="margin-top: 1rem;">
        Попробуйте позже или проверьте правильность развертывания скрипта
      </p>
      <svelte:fragment slot="actions">
        <button
          type="button"
          class="btn-primary"
          on:click={() => (submitErrorMessage = null)}>Понятно</button
        >
      </svelte:fragment>
    </Modal>
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
