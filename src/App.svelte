<script>
  import { onMount } from "svelte";
  import "./app.css";
  import { fade } from "svelte/transition";
  import { formStore, sanitizeFormData } from "./store.svelte.js";
  import { GOOGLE_SCRIPT_URL } from "./constants.js";
  import { validateStepData } from "./schema.js";
  import SuccessScreen from "./components/layout/SuccessScreen.svelte";
  import Modal from "./components/ui/Modal.svelte";
  import Header from "./components/layout/Header.svelte";
  import NavigationButtons from "./components/layout/NavigationButtons.svelte";
  import ThemeSwitcher from "./components/ui/ThemeSwitcher.svelte";
  import Button from "./components/ui/Button.svelte";

  import {
    Intro,
    ApplicationType,
    PersonalData,
    Transportation,
    Provisions,
    Accommodation,
    FreeMic,
  } from "./steps/index.js";

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
      console.log("Accommodation Validation Errors:", result.errors);
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
    if (typeof window !== "undefined" && !showDraftModal) {
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
    // Only window resizing tracking if needed, but not strictly necessary without updateHeaderHeights
  });

  function scrollToTop() {
    const layers = document.querySelectorAll(".step-layer");
    layers.forEach((layer) => {
      layer.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function nextStep() {
    const isValid = validateCurrentStep(true);
    if (!isValid) {
      console.log("Validation failed!", stepErrors);
      return;
    }

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
    {#if isSubmitted}
      <!-- Success Screen -->
      <SuccessScreen onreset={handleReset} />
    {:else}
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
                <div class="step-content">
                  <Intro />
                </div>
              </div>
            {:else if currentStep === 2}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <div class="step-content">
                  <ApplicationType errors={stepErrors} />
                </div>
              </div>
            {:else if currentStep === 3}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <div class="step-content">
                  <PersonalData errors={stepErrors} />
                </div>
              </div>
            {:else if currentStep === 4}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <div class="step-content">
                  <Transportation
                    stepNumber={currentStep - 1}
                    errors={stepErrors}
                  />
                </div>
              </div>
            {:else if currentStep === 5}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <div class="step-content">
                  <Provisions
                    stepNumber={currentStep - 1}
                    errors={stepErrors}
                  />
                </div>
              </div>
            {:else if currentStep === 6}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <div class="step-content">
                  <Accommodation errors={stepErrors} />
                </div>
              </div>
            {:else if currentStep === 7}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <div class="step-content">
                  <FreeMic errors={stepErrors} />
                </div>
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
    {/if}
  </div>

  {#if showClearModal}
    <Modal onclose={() => (showClearModal = false)}>
      {#snippet header()}
        <h2 class="block-title">Очистить форму?</h2>
      {/snippet}
      <p>Вы уверены, что хотите безвозвратно удалить все введенные данные?</p>
      {#snippet actions()}
        <Button variant="secondary" onclick={() => (showClearModal = false)}
          >Отмена</Button
        >
        <Button variant="danger" onclick={clearForm}>Очистить</Button>
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
        Причина: <strong class="error-text">{submitErrorMessage}</strong>
      </p>
      <p class="mt-1">
        Попробуйте позже или проверьте правильность развертывания скрипта
      </p>
      {#snippet actions()}
        <Button variant="danger" onclick={() => (submitErrorMessage = null)}
          >Понятно</Button
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
        <Button
          variant="secondary"
          onclick={() => {
            showDraftModal = false;
            clearForm();
            currentStep = 1;
          }}>Начать заново</Button
        >
        <Button variant="primary" onclick={() => (showDraftModal = false)}
          >Продолжить</Button
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
    display: flex;
    flex-direction: column;
  }

  .step-container {
    flex: 1;
    min-height: 400px;
    width: 100%;
    position: relative;
  }

  .app-body::-webkit-scrollbar-thumb {
    background-color: var(--glass-border);
    border-radius: 4px;
  }

  .app-body::-webkit-scrollbar-thumb:hover {
    background-color: var(--primary);
  }

  .error-text {
    color: #fca5a5;
  }

  .mt-1 {
    margin-top: 1rem;
  }

  .step-layer {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 1.5rem 1.5rem 1.5rem calc(1.5rem + 10px);
  }

  .app-transition-wrapper {
    display: flex;
    flex-direction: column;
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
    .step-content {
      padding: 0.5rem;
    }
  }
</style>
