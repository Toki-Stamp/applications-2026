<script>
  import "@material/web/radio/radio.js";
  import { generateId } from "../../utils.js";
  import HintBox from "../ui/HintBox.svelte";
  import RichText from "../ui/RichText.svelte";
  import FieldLabel from "./FieldLabel.svelte";
  import { dict } from "../../locales/ru.js";

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

  // Create formatted error message
  const errorMsg = $derived(
    hasError ? dict.errors.radio(label || "Значение") : null,
  );
</script>

<div class="form-group">
  <FieldLabel {label} {required} />
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
        <RichText content={errorMsg} />
      </HintBox>
    </div>
  {/if}
</div>

<style>
  .options-container {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
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
    font-size: var(--text-sm);
    margin-top: 2px;
    flex-shrink: 0;
  }
</style>
