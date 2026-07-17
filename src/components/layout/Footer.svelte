<script>
  import Button from "../ui/Button.svelte";
  import Tooltip from "../ui/Tooltip.svelte";
  import { dict } from "../../locales/ru.js";
  let {
    currentStep,
    totalSteps,
    hasErrors = false,
    isSubmitting = false,
    onprev,
    onnext,
    onclear,
  } = $props();
</script>

<footer class="app-footer">
  <div class="footer-content">
    {#if currentStep === 1}
      <div class="center-buttons intro-nav-wrapper">
        <Button variant="primary" class="start-btn" onclick={onnext}>
          {dict.common.start}
        </Button>
      </div>
    {:else}
      <div class="navigation-buttons">
        <div class="left-buttons">
          <Tooltip text={dict.common.clearForm} pos="left">
            <Button
              type="button"
              variant="danger"
              iconOnly={true}
              onclick={onclear}
            >
              <md-icon>delete</md-icon>
            </Button>
          </Tooltip>
        </div>
        <div class="right-buttons">
          {#if currentStep > 2}
            <Tooltip text={dict.common.back} pos="right">
              <Button
                type="button"
                variant="secondary"
                iconOnly={true}
                onclick={onprev}
              >
                <md-icon>arrow_back</md-icon>
              </Button>
            </Tooltip>
          {/if}

          {#if currentStep < totalSteps}
            <Tooltip
              text={hasErrors
                ? dict.common.fillDataToContinue
                : dict.common.next}
              pos="right"
            >
              <Button
                type="button"
                variant={hasErrors ? "secondary" : "primary"}
                locked={hasErrors}
                iconOnly={true}
                onclick={onnext}
              >
                <md-icon>{hasErrors ? "lock" : "arrow_forward"}</md-icon>
              </Button>
            </Tooltip>
          {:else}
            <Tooltip
              text={hasErrors
                ? dict.common.notEnoughData
                : isSubmitting
                  ? dict.common.submitting
                  : dict.common.submit}
              pos="right"
            >
              <Button
                type="submit"
                variant="submit"
                locked={isSubmitting || hasErrors}
                iconOnly={true}
              >
                {#if isSubmitting}
                  <md-icon class="flipping">hourglass_empty</md-icon>
                {:else}
                  <md-icon>{hasErrors ? "lock" : "rocket_launch"}</md-icon>
                {/if}
              </Button>
            </Tooltip>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</footer>

<style>
  .app-footer {
    position: relative;
    width: 100%;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--bg-color) 70%, transparent);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    z-index: 50;
    border-top: 1px solid var(--border-color);
    box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.2);
  }

  .footer-content {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--gap-fields) var(--layout-px-base);
  }

  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--gap-fields);
  }

  .left-buttons,
  .right-buttons {
    display: flex;
    gap: var(--gap-fields);
    align-items: center;
  }

  .left-buttons {
    justify-content: flex-start;
  }

  .right-buttons {
    justify-content: flex-end;
  }

  @media (max-width: 600px) {
    .footer-content {
      padding: var(--gap-sm) var(--gap-fields);
    }
  }

  .intro-nav-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  :global(.start-btn) {
    flex-grow: 0 !important;
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
