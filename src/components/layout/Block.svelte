<script>
  let { title = "", children } = $props();
</script>

<div class="block-card">
  {#if title}
    <h2 class="block-title">{title}</h2>
  {/if}
  {@render children?.()}
</div>

<style>
  /* Glassmorphism Cards */
  .block-card {
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius);
    padding: 2rem;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 10;
    overflow: visible;
    transition: var(--transition);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Inner glow for cards */
  .block-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.05) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0.5;
    transition: var(--transition);
    z-index: 5;
  }

  .block-card:hover {
    border-color: var(--glass-border-hover);
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(139, 92, 246, 0.1);
  }

  .block-card:hover::before {
    opacity: 1;
    background: linear-gradient(135deg, var(--primary) 0%, rgba(255, 255, 255, 0) 50%, var(--accent) 100%);
  }

  .block-title {
    font-size: 1.25rem;
    border-bottom: 1px solid var(--border-color);
    padding: 1.125rem 2rem;
    margin: -2rem -2rem 0 -2rem;
    border-radius: calc(var(--border-radius) - 1px) calc(var(--border-radius) - 1px) 0 0;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1.4;
    gap: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    /* Smart sticky header */
    position: sticky;
    top: -1px;
    z-index: 30;

    background: var(--bg-color-accent);
    background: linear-gradient(to right, color-mix(in srgb, var(--primary) 10%, transparent), transparent),
                linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)), 
                color-mix(in srgb, var(--bg-color-accent) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  /* Add a tiny accent dot to titles */
  .block-title::before,
  .block-title::after {
    content: "";
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    box-shadow: 0 0 8px var(--primary);
  }

  @media (max-width: 600px) {
    .block-card {
      padding: 1rem;
    }

    .block-title {
      top: -1px;
      padding: 1rem;
      margin: -1rem -1rem 0 -1rem;
      font-size: 1.1rem;
    }
  }
</style>
