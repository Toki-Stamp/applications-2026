/**
 * Svelte action to render a node in a different part of the DOM.
 *
 * @param {HTMLElement} node
 * @param {HTMLElement | string} target
 * @returns {{ update: (newTarget: HTMLElement | string) => void, destroy: () => void }}
 */
export function portal(node, target = "body") {
  /** @type {HTMLElement | null} */
  let targetNode;

  async function update(newTarget) {
    target = newTarget;
    if (typeof target === "string") {
      targetNode = document.querySelector(target);
      if (targetNode === null) {
        await tick();
        targetNode = document.querySelector(target);
      }
    } else if (target instanceof HTMLElement) {
      targetNode = target;
    } else {
      throw new TypeError(
        `Unknown portal target type: ${
          target === null ? "null" : typeof target
        }. Allowed types: string (querySelector) or HTMLElement.`,
      );
    }

    if (targetNode) {
      targetNode.appendChild(node);
      node.hidden = false;
    } else {
      console.warn("Portal target not found:", target);
    }
  }

  function destroy() {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  update(target);
  return {
    update,
    destroy,
  };
}

// Tick function to wait for next microtask if target is not ready
function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
