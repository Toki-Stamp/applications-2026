import { iconMap } from "$shared/assets/icons/index.js";

// Prevent uncaught NotSupportedError when @material/web attempts to re-define custom elements like 'md-icon'
if (typeof window !== "undefined" && customElements) {
  const originalDefine = customElements.define.bind(customElements);
  customElements.define = function (name, constructor, options) {
    if (customElements.get(name)) {
      return;
    }
    return originalDefine(name, constructor, options);
  };
}

class MdIcon extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          vertical-align: middle;
          width: 1em;
          height: 1em;
          fill: currentColor;
          contain: content;
          font-style: normal;
          line-height: 1;
        }
        #icon-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        #icon-container svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
          display: block;
        }
        .slot-wrapper {
          display: none !important;
        }
      </style>
      <div id="icon-container"></div>
      <div class="slot-wrapper"><slot></slot></div>
    `;
  }

  connectedCallback() {
    this.render();
    if (!this._observer) {
      this._observer = new MutationObserver(() => this.render());
      this._observer.observe(this, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  }

  static get observedAttributes() {
    return ["icon"];
  }

  attributeChangedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  render() {
    const iconName = (
      this.getAttribute("icon") ||
      this.textContent ||
      ""
    ).trim();
    if (!iconName) return;

    if (this._renderedIcon === iconName) {
      return;
    }

    const svg = iconMap[iconName];
    const container = this.shadowRoot
      ? this.shadowRoot.getElementById("icon-container")
      : null;

    if (svg && container) {
      this._renderedIcon = iconName;
      container.innerHTML = svg;
    } else if (!svg) {
      console.warn(`[md-icon] Icon "${iconName}" not found in local registry.`);
    }
  }
}

if (!customElements.get("md-icon")) {
  customElements.define("md-icon", MdIcon);
}
