<script>
  import { onMount } from "svelte";
  import "./app.css";
  import { fade } from "svelte/transition";
  import { formStore, sanitizeFormData } from "./store.svelte.js";
  import { GOOGLE_SCRIPT_URL } from "./constants.js";
  import { validateStepData } from "./schema.js";

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
  import ThemeSwitcher from "./components/ThemeSwitcher.svelte";

  let isSubmitted = $state(false);
  let isSubmitting = $state(false);
  /** @type {HTMLFormElement | undefined} */
  let formElement = $state();

  const STEP_STORAGE_KEY = "zubr_step_draft_v2";

  let showDraftModal = $state(
    typeof window !== "undefined"
      ? !!localStorage.getItem("zubr_form_draft_2026_v2")
      : false,
  );

  // Compute initial step directly from localStorage to avoid capturing $state reference
  let currentStep = $state(
    typeof window !== "undefined" &&
      !!localStorage.getItem("zubr_form_draft_2026_v2")
      ? Number(localStorage.getItem(STEP_STORAGE_KEY)) || 1
      : 1,
  );
  const totalSteps = 7;
  let headerHeight = $state(100);

  let showClearModal = $state(false);
  /** @type {string | null} */
  let submitErrorMessage = $state(null);

  // --- Zod-based validation ---
  /** @type {Record<string, string>} */
  let stepErrors = $state({});

  /**
   * Validates the current step using Zod.
   * If touchAll=true, marks all fields as touched (e.g. on "Next" click).
   * @param {boolean} touchAll
   */
  function validateCurrentStep(touchAll = false) {
    const data = formStore.data;
    let dataSlice = {};

    if (currentStep === 2) {
      dataSlice = {
        applicationType: data.applicationType,
        totalGroupSize: data.totalGroupSize,
        groupConditions: data.groupConditions,
      };
    } else if (currentStep === 3) {
      dataSlice = {
        applicationType: data.applicationType,
        applicant: data.applicant,
        guests: data.guests,
      };
    } else if (currentStep === 4) {
      dataSlice = {
        transportTo: data.transportTo,
        transportFrom: data.transportFrom,
        transportComment: data.transportComment,
      };
    } else if (currentStep === 5) {
      dataSlice = {
        applicationType: data.applicationType,
        groupConditions: data.groupConditions,
        applicant: data.applicant,
        guests: data.guests,
      };
    } else if (currentStep === 6) {
      dataSlice = {
        applicationType: data.applicationType,
        groupConditions: data.groupConditions,
        applicant: data.applicant,
        guests: data.guests,
      };
    } else if (currentStep === 7) {
      dataSlice = { freeMic: data.freeMic };
    }

    const result = validateStepData(currentStep, dataSlice);
    
    if (currentStep === 6) {
      console.log('Accommodation Validation Errors:', result.errors);
    }

    if (touchAll) {
      // Mark all fields from error keys as touched
      Object.keys(result.errors).forEach((path) => formStore.markTouched(path));
    }

    // Only show errors for touched fields (unless touchAll)
    if (touchAll) {
      stepErrors = result.errors;
    } else {
      /** @type {Record<string, string>} */
      const filtered = {};
      const touched = formStore.meta.touchedFields;
      Object.entries(result.errors).forEach(([key, val]) => {
        if (touched.has(key)) filtered[key] = val;
      });
      stepErrors = filtered;
    }

    return result.success || Object.keys(stepErrors).length === 0;
  }

  // Re-validate when store data OR touchedFields changes
  $effect(() => {
    // JSON.stringify walks all nested properties, subscribing to every data change
    // This ensures text field inputs (oninput) also trigger re-validation
    JSON.stringify(formStore.data);
    const _t = formStore.meta.touchedFields;
    // Defer to avoid infinite loops during Svelte's own update cycle
    setTimeout(() => validateCurrentStep(false), 0);
  });

  // Persist step to localStorage
  $effect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STEP_STORAGE_KEY, String(currentStep));
    }
  });

  // Body overflow for modals
  $effect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow =
        showClearModal || submitErrorMessage || showDraftModal ? "hidden" : "";
    }
  });

  onMount(() => {
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

  $effect(() => {
    // Re-calculate heights when step changes, wait for DOM update
    // Use currentStep as a dependency
    let step = currentStep;
    setTimeout(updateHeaderHeights, 50);
  });

  function scrollToTop() {
    const appBody = document.querySelector('.app-body');
    if (appBody) {
      appBody.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function nextStep() {
    const isValid = validateCurrentStep(true);
    if (!isValid) return;

    if (currentStep < totalSteps) {
      currentStep++;
      stepErrors = {};
      formStore.meta.touchedFields = new Set();
      scrollToTop();
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      stepErrors = {};
      formStore.meta.touchedFields = new Set();
      scrollToTop();
    }
  }

  function clearForm() {
    formStore.reset();
    currentStep = 1;
    showDraftModal = false;
    stepErrors = {};
    showClearModal = false;
    scrollToTop();
  }

  function handleReset() {
    formStore.reset();
    isSubmitted = false;
    currentStep = 1;
    stepErrors = {};
  }

  const submitForm = async () => {
    if (isSubmitting) return;

    const isValid = validateCurrentStep(true);
    if (!isValid) return;

    const finalData = sanitizeFormData(formStore.data);
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
      formStore.reset();
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(STEP_STORAGE_KEY);
      }
      currentStep = 1;
      showDraftModal = false;
    } catch (e) {
      const error = /** @type {Error} */ (e);
      console.error("Error submitting form:", error);
      submitErrorMessage = error.message;
    } finally {
      isSubmitting = false;
    }
  };

  const hasErrors = $derived(Object.keys(stepErrors).length > 0);
</script>

<main id="app">
  <div class="app-transition-wrapper">
    {#if !isSubmitted}
      <form
        class="app-form"
        novalidate
        bind:this={formElement}
        onsubmit={(e) => {
          e.preventDefault();
          submitForm();
        }}
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
                <FormatBlock errors={stepErrors} />
              </div>
            {:else if currentStep === 3}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <PersonalDataBlock errors={stepErrors} />
              </div>
            {:else if currentStep === 4}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <TransportBlock
                  stepNumber={currentStep - 1}
                  errors={stepErrors}
                />
              </div>
            {:else if currentStep === 5}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <ProvisionsBlock
                  stepNumber={currentStep - 1}
                  errors={stepErrors}
                />
              </div>
            {:else if currentStep === 6}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <AccommodationBlock errors={stepErrors} />
              </div>
            {:else if currentStep === 7}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <FreeMicBlock errors={stepErrors} />
              </div>
            {/if}
          </div>
        </div>

        <!-- Navigation Buttons -->
        <NavigationButtons
          {currentStep}
          {totalSteps}
          {hasErrors}
          {isSubmitting}
          onprev={prevStep}
          onnext={nextStep}
          onclear={() => (showClearModal = true)}
        />
      </form>
    {:else}
      <!-- Success Screen -->
      <SuccessScreen onreset={handleReset} />
    {/if}
  </div>

  {#if showClearModal}
    <Modal onclose={() => (showClearModal = false)}>
      {#snippet header()}
        <h2 class="block-title">Очистить форму?</h2>
      {/snippet}
      <p>Вы уверены, что хотите безвозвратно удалить все введенные данные?</p>
      {#snippet actions()}
        <button
          type="button"
          class="btn-secondary"
          onclick={() => (showClearModal = false)}>Отмена</button
        >
        <button type="button" class="btn-danger" onclick={clearForm}
          >Очистить</button
        >
      {/snippet}
    </Modal>
  {/if}

  {#if submitErrorMessage}
    <Modal variant="danger" onclose={() => (submitErrorMessage = null)}>
      {#snippet header()}
        <h2 class="block-title">
          <span>Сбой при отправке!</span>
        </h2>
      {/snippet}
      <p>
        Причина: <strong style="color: #fca5a5;">{submitErrorMessage}</strong>
      </p>
      <p style="margin-top: 1rem;">
        Попробуйте позже или проверьте правильность развертывания скрипта
      </p>
      {#snippet actions()}
        <button
          type="button"
          class="btn-danger"
          onclick={() => (submitErrorMessage = null)}>Понятно</button
        >
      {/snippet}
    </Modal>
  {/if}

  {#if showDraftModal}
    <Modal
      variant="info"
      dismissible={false}
      onclose={() => (showDraftModal = false)}
    >
      {#snippet header()}
        <h2 class="block-title">С возвращением!</h2>
      {/snippet}
      <p>У Вас осталась неотправленная заявка.</p>
      <p>Хотите продолжить её заполнение или начать всё заново?</p>
      {#snippet actions()}
        <button
          type="button"
          class="btn-secondary"
          onclick={() => {
            showDraftModal = false;
            clearForm();
            currentStep = 1;
          }}>Начать заново</button
        >
        <button
          type="button"
          class="btn-primary"
          onclick={() => (showDraftModal = false)}>Продолжить</button
        >
      {/snippet}
    </Modal>
  {/if}
</main>

<style>
  .app-form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .app-body {
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 0;
    overflow-y: scroll;
  }

  .step-container {
    display: grid;
    min-height: 400px;
    max-width: 800px;
    margin: 0 auto;
    padding: 1.5rem 1.5rem 1.5rem calc(1.5rem + 10px);
  }

  .step-layer {
    grid-column: 1;
    grid-row: 1;
  }

  .app-transition-wrapper {
    display: grid;
    width: 100%;
    flex: 1;
    min-height: 0;
  }

  .app-form {
    grid-area: 1 / 1;
    width: 100%;
    min-height: 0;
  }

  @media (max-width: 600px) {
    .step-container {
      padding: 0.5rem;
    }
  }
</style>
