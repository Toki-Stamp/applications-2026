# Behavior Guidelines

## Git Commits

Do not automatically create Git commits after completing a task or a step. Only commit changes when explicitly requested by the user. 
**CRITICAL**: Before creating a commit, you MUST run the full test suite (`npm run test`, which includes both unit and E2E tests) and wait for all tests to pass successfully. Never commit broken code. If a task is complete, notify the user and wait for their explicit permission before running any git commit commands.


## 3. Layout Components and CSS Utilities

When creating reusable layout elements (like footers, panels, or wrappers) that primarily provide styling (e.g. glassmorphism, borders, shadows), prefer using **global CSS utility classes** (like `.layout-footer` or `.glass-panel` in `app.css`) instead of creating Svelte wrapper components (like `<Footer>`). This prevents issues with Svelte 5 snippets (`{@render children()}`) and avoids breaking DOM animations (`transition:slide`) in consuming components. Subsequent pages should use these CSS classes on standard HTML tags (e.g., `<footer class="layout-footer">...</footer>`).
