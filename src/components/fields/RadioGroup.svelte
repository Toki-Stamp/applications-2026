<script>
  import "@material/web/radio/radio.js";
  import { generateId } from "../../utils.js";
  import HintBox from "../ui/HintBox.svelte";
  import { ERROR_MESSAGES } from "../../constants.js";

  let {
    value = $bindable(),
    label = "",
    options = [],
    required = false,
    name = generateId("radiogroup"),
    errorText = "",
    onchange,
    ...restProps
  } = $props();

  /** @param {any} optValue */
  function handleChange(optValue) {
    value = optValue;
    onchange?.();
  }

  const hasError = $derived(!!errorText);

  // Create formatted error message matching the old structure
  const errorMsg = $derived(
    hasError ? ERROR_MESSAGES.RADIO(label || "Значение") : null,
  );
</script>

<div class="form-group">
  {#if label}
    <div class="group-label">
      {label}
      <span class="optional-tag">
        {required ? "(Обязательно для заполнения)" : ""}
      </span>
    </div>
  {/if}
  <div class="options-container">
    {#each options as opt}
      {@const optVal = opt.value !== undefined ? opt.value : opt}
      {@const mainLabel = opt.label !== undefined ? opt.label : String(opt)}
      {@const suppText = opt.helperText || null}
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <label class="radio-label" onclick={() => handleChange(optVal)}>
        <md-radio
          class="radio-input"
          {name}
          value={optVal}
          checked={value === optVal}
          {...restProps}
          onchange={() => handleChange(optVal)}
        ></md-radio>
        <div class="text-container">
          <span class="main-label">{mainLabel}</span>
          {#if suppText}
            <span class="supp-text">
              <strong>Подсказка:</strong>
              {suppText}
            </span>
          {/if}
        </div>
      </label>
    {/each}
  </div>
  {#if hasError && errorMsg}
    <div class="error-wrapper">
      <HintBox type="error">
        {errorMsg.prefix}<strong class="text-primary">{errorMsg.label}</strong
        >{errorMsg.suffix}
      </HintBox>
    </div>
  {/if}
</div>

<style>
  .options-container {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .radio-label {
    display: flex;
    align-items: flex-start;
    cursor: pointer;
    padding: 0.3rem 0;
  }

  .radio-input {
    margin-top: 2px;
    flex-shrink: 0;
  }

  .text-container {
    margin-left: 12px;
    display: flex;
    flex-direction: column;
  }

  .main-label {
    color: var(--text-primary);
  }

  .supp-text {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .error-wrapper {
    margin-top: 0.5rem;
  }
</style>
