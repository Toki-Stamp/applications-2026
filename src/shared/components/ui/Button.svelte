<script>
  /**
   * @typedef {Object} Props
   * @property {"button" | "submit" | "reset"} [type]
   * @property {"primary" | "secondary" | "danger" | "submit" | "clear" | "outline"} [variant]
   * @property {boolean} [iconOnly]
   * @property {boolean} [locked]
   * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement>} [onclick]
   * @property {import('svelte').Snippet} [children]
   * @property {string} [class]
   * @property {string} [aria-label]
   */

  /** @type {Props} */
  let {
    type = "button",
    variant = "primary",
    iconOnly = false,
    locked = false,
    onclick = undefined,
    children,
    class: className = "",
    ...rest
  } = $props();

  let buttonClass = $derived(
    [
      variant === "clear" ? "compact-clear-btn" : `btn-${variant}`,
      iconOnly ? "icon-only" : "",
      locked ? "btn-locked" : "",
      className,
    ]
      .filter(Boolean)
      .join(" "),
  );
</script>

<button {type} class={buttonClass} {onclick} disabled={locked} {...rest}>
  {#if children}{@render children()}{/if}
</button>

<style>
  .btn-primary,
  .btn-secondary,
  .btn-danger,
  .btn-submit,
  .btn-outline {
    padding: var(--element-py) var(--element-px);
    font-size: var(--text-base);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-sm);
  }

  button:disabled,
  .btn-locked {
    background: linear-gradient(
      135deg,
      rgba(82, 82, 91, 0.5) 0%,
      rgba(63, 63, 70, 0.5) 100%
    ) !important;
    color: rgba(255, 255, 255, 0.4) !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
    transform: none !important;
  }

  button:disabled::before,
  .btn-locked::before {
    display: none !important;
  }

  :global(.btn-primary md-icon),
  :global(.btn-secondary md-icon),
  :global(.btn-danger md-icon),
  :global(.btn-submit md-icon),
  :global(.btn-outline md-icon) {
    font-size: var(--text-xl);
    --md-icon-size: var(--text-xl);
  }

  .icon-only {
    width: 55px;
    height: 55px;
    padding: 0 !important;
    border-radius: 50% !important;
    min-width: 0 !important;
    flex-grow: 0 !important;
  }

  :global(.icon-only md-icon) {
    font-size: var(--text-3xl) !important;
    --md-icon-size: var(--text-3xl);
    width: var(--text-3xl);
    height: var(--text-3xl);
  }

  /* Primary Variant */
  .btn-primary {
    color: var(--btn-primary-text);
    background: linear-gradient(135deg, var(--primary), var(--cyan));
    border: none;
    box-shadow: 0 4px 15px var(--primary-glow);
    flex-grow: 1;
  }
  .btn-primary::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%);
    border-radius: inherit;
    z-index: -1;
    transition: opacity 0.4s ease;
    opacity: 0;
  }
  .btn-primary:hover {
    box-shadow: 0 8px 25px var(--primary-glow);
    transform: translateY(-2px) scale(1.01);
  }
  .btn-primary:hover::before {
    opacity: 1;
  }

  /* Secondary Variant */
  .btn-secondary {
    color: white;
    background: linear-gradient(135deg, #52525b 0%, #3f3f46 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(82, 82, 91, 0.3);
  }
  .btn-secondary::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #3f3f46 0%, #52525b 100%);
    border-radius: inherit;
    z-index: -1;
    transition: opacity 0.4s ease;
    opacity: 0;
  }
  .btn-secondary:hover {
    box-shadow: 0 8px 25px rgba(82, 82, 91, 0.4);
    transform: translateY(-2px) scale(1.01);
  }
  .btn-secondary:hover::before {
    opacity: 1;
  }

  /* Outline Variant */
  .btn-outline {
    color: var(--text-primary);
    background: transparent;
    border: 1px solid var(--glass-border);
    box-shadow: none;
  }
  .btn-outline::before {
    display: none;
  }
  .btn-outline:hover {
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    border-color: color-mix(in srgb, var(--primary) 50%, var(--glass-border));
    transform: translateY(-2px) scale(1.01);
  }

  /* Danger Variant */
  .btn-danger {
    color: white;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
  }
  .btn-danger::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%);
    border-radius: inherit;
    z-index: -1;
    transition: opacity 0.4s ease;
    opacity: 0;
  }
  .btn-danger:hover {
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
    transform: translateY(-2px) scale(1.01);
  }
  .btn-danger:hover::before {
    opacity: 1;
  }

  /* Submit Variant */
  .btn-submit {
    color: var(--btn-primary-text);
    padding: calc(var(--element-py) * 1.125) calc(var(--element-px) * 1.5);
    font-size: var(--text-lg);
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    box-shadow: 0 4px 15px var(--primary-glow);
    border: none;
  }
  .btn-submit::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%);
    border-radius: inherit;
    z-index: -1;
    transition: opacity 0.4s ease;
    opacity: 0;
  }
  .btn-submit:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 30px var(--accent-glow);
  }
  .btn-submit:hover::before {
    opacity: 1;
  }
  .btn-submit:active {
    transform: translateY(0) scale(0.99);
  }

  /* Clear Variant */
  .compact-clear-btn {
    background: var(--glass-border);
    border: none;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    cursor: pointer;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    transition:
      background-color 0.2s,
      color 0.2s;
    z-index: 2;
  }
  :global(.compact-clear-btn md-icon) {
    font-size: var(--text-xl);
  }
  .compact-clear-btn:hover {
    background: color-mix(
      in srgb,
      var(--primary) 20%,
      var(--glass-border-hover)
    );
    color: var(--text-primary);
  }
  .compact-clear-btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
</style>
