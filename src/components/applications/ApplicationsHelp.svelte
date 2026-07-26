<script>
  import Block from "../layout/Block.svelte";
  import HintBox from "../ui/HintBox.svelte";
  import RichText from "../ui/RichText.svelte";
  import Kbd from "../ui/Kbd.svelte";
  import { dict } from "../../locales/ru.js";
</script>

<div class="applications-help">
  <Block title="Справка" icon="live_help">
    <div class="hints-container">
      <HintBox>
        <!-- prettier-ignore -->
        <span>{dict.options.globalHints.filterPrefix}<md-icon class="inline-icon">directions_car</md-icon>|<md-icon class="inline-icon">hail</md-icon>|<md-icon class="inline-icon">directions_bus</md-icon>|<md-icon class="inline-icon">directions_walk</md-icon>{dict.options.globalHints.filterSuffix}</span>
      </HintBox>
      <HintBox>
        <RichText content={dict.options.globalHints.activeFilters} />
      </HintBox>
      <HintBox>
        <!-- prettier-ignore -->
        <span>{dict.options.globalHints.filterModePrefix}<md-icon class="inline-icon">visibility</md-icon>{dict.options.globalHints.filterModeSuffix}</span>
      </HintBox>
      <HintBox>
        <!-- prettier-ignore -->
        <span>{dict.options.globalHints.pinPrefix}<md-icon class="inline-icon" style="transform: rotate(45deg); font-size: 1.2em;">push_pin</md-icon>{dict.options.globalHints.pinSuffix}</span>
      </HintBox>
      <HintBox>
        <RichText content={dict.options.globalHints.select} />
      </HintBox>
      <div class="desktop-only">
        <HintBox>
          {dict.options.globalHints.hotkeysPrefix}<Kbd>Ctrl</Kbd> / <Kbd>Cmd</Kbd>{dict.options.globalHints.hotkeysMiddle}<Kbd variant="accent">Shift</Kbd>{dict.options.globalHints.hotkeysSuffix}
        </HintBox>
      </div>
    </div>
  </Block>
</div>

<style>
  .applications-help {
    --help-gap: var(--gap-fields);
    --help-padding: var(--gap-section);
  }

  @media (max-width: 600px) {
    .applications-help {
      --help-gap: var(--gap-sm);
      --help-padding: var(--gap-fields);
    }
  }

  .hints-container {
    display: flex;
    flex-direction: column;
    gap: var(--help-gap);
  }

  .applications-help :global(.block-title) {
    padding-left: var(--help-padding);
    padding-right: var(--help-padding);
  }

  .applications-help :global(.block-content) {
    padding: var(--help-padding) !important;
  }

  /* Reset Block background since Popover provides glass panel */
  .applications-help :global(.block-card) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
  .applications-help :global(.block-card)::before {
    display: none;
  }

  @media (max-width: 600px) {
    .desktop-only {
      display: none !important;
    }
  }

  .inline-icon {
    vertical-align: middle;
    color: var(--primary);
    font-size: 1.4em;
    margin: 0 2px;
    position: relative;
    top: -2px;
  }
</style>
