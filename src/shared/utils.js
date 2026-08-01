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
  const style = getComputedStyle(node);
  const marginTop = parseFloat(style.marginTop) || 0;
  const marginBottom = parseFloat(style.marginBottom) || 0;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;

  return {
    duration,
    easing,
    /** @param {number} t */
    css: (t) => `
      display: grid; 
      grid-template-rows: ${t}fr;
      margin-top: ${t * marginTop}px;
      margin-bottom: ${t * marginBottom}px;
      padding-top: ${t * paddingTop}px;
      padding-bottom: ${t * paddingBottom}px;
      opacity: ${t};
    `,
  };
}

/**
 * Formats the applicant name display for differential sections
 * @param {Object} applicant
 * @returns {string}
 */
export function getApplicantDisplayName(applicant) {
  const main = applicant.nickname || "Заявителя";
  const fullName = [applicant.firstName, applicant.lastName]
    .filter(Boolean)
    .join(" ");
  return fullName ? `${main} (${fullName})` : main;
}

/**
 * Formats the guest name display for differential sections
 * @param {Object} guest
 * @param {number} index
 * @returns {string}
 */
export function getGuestDisplayName(guest, index) {
  const fullName = [guest.firstName, guest.lastName].filter(Boolean).join(" ");
  const main = fullName || `Гостя #${index + 1}`;
  return guest.nickname ? `${main} (${guest.nickname})` : main;
}
