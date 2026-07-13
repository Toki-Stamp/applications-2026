<script>
  import { createEventDispatcher } from "svelte";

  export let currentStep;
  export let totalSteps;
  export let hasErrors = false;
  export let isSubmitting = false;

  const dispatch = createEventDispatcher();
</script>

<footer class="app-footer">
  <div class="footer-content">
    {#if currentStep === 1}
      <div class="center-buttons intro-nav-wrapper">
        <button
          type="button"
          class="btn-primary start-btn"
          on:click={() => dispatch("next")}
        >
          Начать заполнение
        </button>
      </div>
    {:else}
      <div class="navigation-buttons">
        <div class="left-buttons">
          <button
            type="button"
            class="btn-danger icon-only"
            data-tooltip="Очистить форму"
            data-tooltip-pos="left"
            on:click={() => dispatch("clear")}
          >
            <md-icon>delete</md-icon>
          </button>
        </div>
        <div class="right-buttons">
          {#if currentStep > 2}
            <button
              type="button"
              class="btn-secondary icon-only"
              data-tooltip="Назад"
              data-tooltip-pos="right"
              on:click={() => dispatch("prev")}
            >
              <md-icon>arrow_back</md-icon>
            </button>
          {/if}

          {#if currentStep < totalSteps}
            <button
              type="button"
              class="{hasErrors ? 'btn-secondary btn-locked' : 'btn-primary'} icon-only"
              disabled={hasErrors}
              data-tooltip={hasErrors
                ? "Исправьте ошибки, чтобы продолжить"
                : "Далее"}
              data-tooltip-pos="right"
              on:click={() => dispatch("next")}
            >
              <md-icon>{hasErrors ? "lock" : "arrow_forward"}</md-icon>
            </button>
          {:else}
            <button
              type="submit"
              class="{hasErrors ? 'btn-submit btn-locked' : 'btn-submit'} icon-only"
              disabled={isSubmitting}
              data-tooltip={hasErrors
                ? "Данные заполнены некорректно"
                : isSubmitting
                  ? "Подождите, идет отправка"
                  : "Отправить заявку"}
              data-tooltip-pos="right"
            >
              {#if isSubmitting}
                <md-icon class="flipping">hourglass_empty</md-icon>
              {:else}
                <md-icon>{hasErrors ? "lock" : "rocket_launch"}</md-icon>
              {/if}
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</footer>

<style>
  .app-footer {
    position: fixed;
    bottom: 0;
    left: 0;
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
    align-items: center;
  }

  .right-buttons {
    flex: 1;
    justify-content: flex-end;
  }

  @media (max-width: 600px) {
    .footer-content {
      padding: 0.5rem 1rem;
    }
  }

  .intro-nav-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .start-btn {
    min-width: 250px;
    flex-grow: 0;
  }

  @keyframes flip {
    0%,
    15% {
      transform: rotate(0deg);
    }
    45%,
    65% {
      transform: rotate(180deg);
    }
    95%,
    100% {
      transform: rotate(360deg);
    }
  }

  .flipping {
    animation: flip 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
</style>
