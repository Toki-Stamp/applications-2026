<script>
  import Block from "../layout/Block.svelte";
  import HintBox from "../ui/HintBox.svelte";
  import RichText from "../ui/RichText.svelte";
  import Kbd from "../ui/Kbd.svelte";
  import { dict } from "../../locales/ru.js";

  let isScrolled = $state(false);

  /** @param {UIEvent & { currentTarget: HTMLElement }} e */
  function handleScroll(e) {
    isScrolled = e.currentTarget.scrollTop > 2;
  }
</script>

<div class="applications-help" class:is-scrolled={isScrolled}>
  <Block title="Справка" icon="live_help">
    <div class="hints-container" onscroll={handleScroll}>
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
        <RichText content={dict.options.globalHints.cellFilter} />
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

  .hints-container {
    display: flex;
    flex-direction: column;
    gap: var(--help-gap);
    max-height: 40vh; /* Roughly half the table height */
    overflow-y: auto;
    /* Компенсация: 6px скроллбар + 2px отступ block-content = 8px */
    padding-top: var(--help-padding);
    padding-bottom: var(--help-padding);
    padding-left: var(--help-padding);
    padding-right: calc(var(--help-padding) - 8px);
  }
  
  .hints-container::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .hints-container::-webkit-scrollbar-track {
    background: transparent;
    margin-top: 8px;
    margin-bottom: 8px; /* Половина радиуса скругления */
  }
  .hints-container::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 10px;
  }

  @media (max-width: 600px) {
    .applications-help {
      --help-gap: var(--gap-sm);
      --help-padding: var(--gap-fields);
    }
    .hints-container {
      max-height: 50dvh; /* Ровно половина экрана */
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
    border-radius: calc(var(--border-radius) - 1px) calc(var(--border-radius) - 1px) 0 0;
  }

  .applications-help.is-scrolled :global(.block-title) {
    box-shadow: var(--shadow-header) !important;
    border-bottom-color: var(--border-color) !important;
  }

  .applications-help :global(.block-content) {
    padding: 0 !important;
    padding-right: 2px !important; /* tiny gap so scrollbar doesn't clip border radius perfectly */
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
