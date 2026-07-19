<script>
  import { onMount } from "svelte";
  import "./app.css";
  import { fade } from "svelte/transition";
  import { formStore } from "./store.svelte.js";
  import {
    GOOGLE_SCRIPT_URL,
    FORM_STORAGE_KEY,
    STEP_STORAGE_KEY,
  } from "./constants.js";
  import { dict } from "./locales/ru.js";
  import { validateStepData, sanitizeFormData } from "./schema.js";

  import Overlay from "./components/ui/Overlay.svelte";
  import Modal from "./components/ui/Modal.svelte";
  import Header from "./components/layout/Header.svelte";
  import Footer from "./components/layout/Footer.svelte";
  import Button from "./components/ui/Button.svelte";

  import {
    Intro,
    ApplicationType,
    PersonalData,
    Transportation,
    Provisions,
    Accommodation,
    FreeMic,
    Outro,
  } from "./steps/index.js";

  let isSubmitted = $state(false);
  let isSubmitting = $state(false);

  let showDraftModal = $state(
    typeof window !== "undefined"
      ? !!localStorage.getItem(FORM_STORAGE_KEY)
      : false,
  );

  let currentStep = $state(
    typeof window !== "undefined" && !!localStorage.getItem(FORM_STORAGE_KEY)
      ? Number(localStorage.getItem(STEP_STORAGE_KEY)) || 1
      : 1,
  );
  const totalSteps = 7;
  let headerHeight = $state(100);

  let showClearModal = $state(false);
  /** @type {{ title: string, body: string } | null} */
  let submitErrorData = $state(null);

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

  // Re-validate and autosave when store data OR touchedFields changes
  $effect(() => {
    // JSON.stringify walks all nested properties, subscribing to every data change
    // This ensures text field inputs (oninput) also trigger re-validation
    JSON.stringify(formStore.data);
    const _t = formStore.meta.touchedFields;

    // Save draft to localStorage
    formStore.save();

    // Defer to avoid infinite loops during Svelte's own update cycle
    setTimeout(() => validateCurrentStep(false), 0);
  });

  // Persist step to localStorage
  $effect(() => {
    // This effect runs whenever `formStore.data` or `currentStep` changes deeply.
    formStore.save();
    if (typeof window !== "undefined") {
      localStorage.setItem(STEP_STORAGE_KEY, currentStep.toString());
    }
  });

  onMount(() => {
    if (localStorage.getItem(FORM_STORAGE_KEY)) {
      const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
      if (savedStep) {
        currentStep = parseInt(savedStep, 10) || 1;
      }
      showDraftModal = true;
    }
  });

  $effect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow =
        showClearModal || submitErrorData || showDraftModal ? "hidden" : "";
    }
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
    if (typeof window !== "undefined") {
      localStorage.removeItem(STEP_STORAGE_KEY);
    }
    showClearModal = false;
    stepErrors = {};
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
      
      let errorTitle = dict.modals.submitError.types.unknown.title;
      let errorBody = dict.modals.submitError.types.unknown.bodyPrefix + error.message;

      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        errorTitle = dict.modals.submitError.types.network.title;
        errorBody = dict.modals.submitError.types.network.body;
      } else if (error.message.includes("Ошибка HTTP") || error.message.includes("500") || error.message.includes("404")) {
        errorTitle = dict.modals.submitError.types.server.title;
        errorBody = dict.modals.submitError.types.server.body;
      } else if (error.message.includes("Неизвестная ошибка на стороне сервера") || error.message.includes("LogicError:")) {
        errorTitle = dict.modals.submitError.types.logic.title;
        errorBody = dict.modals.submitError.types.logic.bodyPrefix + error.message.replace("LogicError:", "");
      } else if (error.message.includes("GOOGLE_SCRIPT_URL")) {
        errorTitle = dict.modals.submitError.types.setup.title;
        errorBody = dict.modals.submitError.types.setup.body;
      }

      submitErrorData = {
        title: errorTitle,
        body: errorBody
      };
    } finally {
      isSubmitting = false;
    }
  };

  const hasErrors = $derived(Object.keys(stepErrors).length > 0);
</script>

<main id="app" class:is-submitting={isSubmitting}>
  {#if isSubmitting}
    <Overlay variant="loading" absolute={true} zIndex={1000}>
      <md-icon class="flipping large-icon text-primary">hourglass_empty</md-icon>
      <p class="submit-text">{dict.common.submitting}</p>
    </Overlay>
  {/if}
  <div class="app-transition-wrapper">
      <form
        class="app-form"
        novalidate
        onsubmit={(e) => {
          e.preventDefault();
          submitForm();
        }}
        transition:fade={{ duration: 300 }}
      >
        {#if !isSubmitted}
          <Header bind:headerHeight {currentStep} {totalSteps} />
        {/if}

        <div class="app-body" style="--header-height: {headerHeight}px;">
          <!-- Wizard Steps Container -->
          <div class="step-container">
            {#if !isSubmitted}
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
            {:else}
              <div transition:fade={{ duration: 300 }} class="step-layer">
                <div class="step-content">
                  <Outro onreset={handleReset} />
                </div>
              </div>
            {/if}
          </div>

          <!-- Navigation Buttons -->
          <Footer
            {currentStep}
            {totalSteps}
            {hasErrors}
            {isSubmitting}
            {isSubmitted}
            onprev={prevStep}
            onnext={nextStep}
            onclear={() => (showClearModal = true)}
            onreset={handleReset}
          />
        </div>
      </form>
  </div>
  {#if showClearModal}
    <Modal
      title={dict.modals.clear.title}
      onclose={() => (showClearModal = false)}
    >
      <p>{dict.modals.clear.body}</p>
      {#snippet actions()}
        <Button variant="secondary" onclick={() => (showClearModal = false)}
          >{dict.common.cancel}</Button
        >
        <Button variant="danger" onclick={clearForm}>{dict.common.clear}</Button
        >
      {/snippet}
    </Modal>
  {/if}

  {#if submitErrorData}
    <Modal
      title={submitErrorData.title}
      variant="danger"
      onclose={() => (submitErrorData = null)}
    >
      <p>
        {@html submitErrorData.body}
      </p>
      {#snippet actions()}
        <Button variant="danger" onclick={() => (submitErrorData = null)}
          >{dict.modals.submitError.gotIt}</Button
        >
      {/snippet}
    </Modal>
  {/if}

  {#if showDraftModal}
    <Modal
      title={dict.modals.draft.title}
      variant="info"
      dismissible={false}
      onclose={() => (showDraftModal = false)}
    >
      <p>{dict.modals.draft.body1}</p>
      <p>{dict.modals.draft.body2}</p>
      {#snippet actions()}
        <Button
          variant="secondary"
          onclick={() => {
            showDraftModal = false;
            clearForm();
          }}>{dict.modals.draft.restart}</Button
        >
        <Button variant="primary" onclick={() => (showDraftModal = false)}
          >{dict.modals.draft.continue}</Button
        >
      {/snippet}
    </Modal>
  {/if}
</main>

<style>
  #app {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .large-icon {
    font-size: 64px;
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
  }

  .submit-text {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--text-primary);
  }

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

  .step-layer {
    position: absolute;
    inset: 0;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: var(--gap-layout) calc(var(--gap-layout) - var(--scrollbar-width)) var(--gap-layout) var(--gap-layout);
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
      padding: var(--gap-fields);
    }
  }
</style>
