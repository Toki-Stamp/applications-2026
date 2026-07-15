let idCounter = 0;

/**
 * Generates a sequential ID that is SSR-safe (unlike Math.random())
 * @param {string} prefix
 * @returns {string}
 */
export function generateId(prefix = "el") {
  return `${prefix}-${idCounter++}`;
}

import { cubicOut } from "svelte/easing";

/**
 * Custom Svelte transition using CSS Grid for flawless height animation
 * @param {HTMLElement} node
 * @param {{duration?: number, easing?: any}} [options]
 */
export function gridExpand(node, { duration = 300, easing = cubicOut } = {}) {
  return {
    duration,
    easing,
    /** @param {number} t */
    css: (t) => `display: grid; grid-template-rows: ${t}fr;`,
  };
}
