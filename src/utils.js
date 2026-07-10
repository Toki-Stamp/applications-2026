let idCounter = 0;

/**
 * Generates a sequential ID that is SSR-safe (unlike Math.random())
 * @param {string} prefix
 * @returns {string}
 */
export function generateId(prefix = 'el') {
  return `${prefix}-${idCounter++}`;
}
