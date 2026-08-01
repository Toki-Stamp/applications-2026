<script>
  /** @type {{ size?: string, class?: string }} */
  let { size = "1em", class: className = "" } = $props();
</script>

<span
  class="hourglass-loader {className}"
  style="font-size: {size}; width: {size}; height: {size};"
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
    <path
      class="hourglass-frame"
      fill="currentColor"
      fill-rule="evenodd"
      d="M320-160h320v-120q0-66-47-113t-113-47q-66 0-113 47t-47 113v120Zm273-407q47-47 47-113v-120H320v120q0 66 47 113t113 47q66 0 113-47ZM160-80v-80h80v-120q0-61 28.5-114.5T348-480q-51-32-79.5-85.5T240-680v-120h-80v-80h640v80h-80v120q0 61-28.5 114.5T612-480q51 32 79.5 85.5T720-280v120h80v80H160Z"
    />
    <path
      class="sand-top"
      fill="var(--text-primary, currentColor)"
      d="M593-567q47-47 47-113v-120H320v120q0 66 47 113t113 47q66 0 113-47Z"
    />
    <path
      class="sand-bottom"
      fill="var(--text-primary, currentColor)"
      d="M320-160h320v-120q0-66-47-113t-113-47q-66 0-113 47t-47 113v120Z"
    />
  </svg>
</span>

<style>
  .hourglass-loader {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    line-height: 1;
    contain: content;
  }

  .hourglass-loader svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
    display: block;
    animation: hourglass-flip-anim 1.35s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    transform-origin: center center;
  }

  .hourglass-loader .sand-top {
    animation: hourglass-sand-top-anim 1.35s step-end infinite;
    fill: var(--text-primary, currentColor);
  }

  .hourglass-loader .sand-bottom {
    animation: hourglass-sand-bottom-anim 1.35s step-start infinite;
    fill: var(--text-primary, currentColor);
  }

  @keyframes hourglass-sand-top-anim {
    0%,
    33% {
      opacity: 1;
    }
    34%,
    100% {
      opacity: 0;
    }
  }

  @keyframes hourglass-sand-bottom-anim {
    0%,
    33% {
      opacity: 0;
    }
    34%,
    100% {
      opacity: 1;
    }
  }

  @keyframes hourglass-flip-anim {
    0%,
    66% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(180deg);
    }
  }
</style>
