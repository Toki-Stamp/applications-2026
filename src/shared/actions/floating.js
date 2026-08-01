import {
  computePosition,
  autoUpdate,
  flip,
  shift,
  offset,
} from "@floating-ui/dom";

/**
 * @typedef {Object} FloatingOptions
 * @property {HTMLElement | null} referenceNode
 * @property {string} [placement]
 * @property {number} [offsetValue]
 */

/**
 * Svelte action to position an element using floating-ui
 *
 * @param {HTMLElement} node
 * @param {FloatingOptions} options
 */
export function floating(node, options) {
  let { referenceNode, placement = "bottom", offsetValue = 10 } = options;
  /** @type {Function | null} */
  let cleanup = null;

  function updatePosition() {
    if (!referenceNode) return;

    let finalPlacement = placement;
    // Map legacy custom positions to Floating UI standard placements
    if (placement === "left") finalPlacement = "top-start";
    if (placement === "right") finalPlacement = "top-end";
    if (placement === "bottom-left") finalPlacement = "bottom-start";
    if (placement === "bottom-right") finalPlacement = "bottom-end";

    computePosition(referenceNode, node, {
      placement: /** @type {import('@floating-ui/dom').Placement} */ (
        finalPlacement
      ),
      strategy: "fixed",
      middleware: [offset(offsetValue), flip(), shift({ padding: 12 })],
    }).then(({ x, y }) => {
      Object.assign(node.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

  function init() {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    if (referenceNode) {
      cleanup = autoUpdate(referenceNode, node, updatePosition, {
        animationFrame: true,
      });
    }
  }

  init();

  return {
    /**
     * @param {FloatingOptions} newOptions
     */
    update(newOptions) {
      const referenceChanged = referenceNode !== newOptions.referenceNode;
      referenceNode = newOptions.referenceNode;
      placement = newOptions.placement || "bottom";
      offsetValue = newOptions.offsetValue ?? 10;

      if (referenceChanged) {
        init();
      } else if (referenceNode) {
        updatePosition();
      }
    },
    destroy() {
      if (cleanup) cleanup();
    },
  };
}
