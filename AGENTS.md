# Guidelines for AI Coding Agents

## 1. Icon System (Google Material Symbols / SVG)

Project uses an optimized lightweight SVG-based icon component for Google Material Symbols instead of the heavy 3.96 MB `material-symbols-outlined.woff2` font bundle.

### Usage in Svelte / HTML:

Use standard `<md-icon>` tag:

```html
<md-icon>directions_car</md-icon> <md-icon class="hint-icon">settings</md-icon>
```

### Adding New Icons:

If a new icon is needed in a feature or component:

1. Run the fetch script:
   ```bash
   npm run fetch-icon <icon_name>
   ```
   _Example:_ `npm run fetch-icon favorite`
2. The script will automatically download the SVG from Google Fonts CDN to `src/assets/icons/<icon_name>.svg` and update `src/assets/icons/index.js`.

### Cleaning Unused Icons:

If an icon is no longer used in the codebase after refactoring or removing a feature, run:

```bash
npm run clean-icons
```

The script will scan all Svelte/JS files in `src/`, identify any orphan `.svg` files in `src/assets/icons/`, safely delete them, and update `index.js`.

---

## 2. Git Commits

Do not automatically create Git commits after completing a task or a step. Only commit changes when explicitly requested by the user.
