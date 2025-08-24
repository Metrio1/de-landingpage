import { ScrollManager } from "@/js/utils/ScrollManager.js";

export class ModalManager {
    static classNames = {
        open: "isOpen",
        base: "modal",
    };

    static dataAttrs = {
        openTrigger: "data-js-modal-open",
        modalType: "data-js-modal-type",
        closeTrigger: "data-js-modal-close",
        backdrop: "data-js-modal-backdrop",
        focusGuard: "data-js-focus-guard",
    };

    #modalRegistry = new Map();
    #backdropNode = null;

    constructor() {
        this.#backdropNode = document.querySelector(`[${ModalManager.dataAttrs.backdrop}]`);
        this.#attachGlobalListeners();
    }

    getOpenModal() {
        for (const [node, state] of this.#modalRegistry.entries()) {
            if (state.isOpen) return [node, state];
        }
        return [null, null];
    }

    open({ src, type = "selector", showBackdrop = true, autoCloseAfterMs } = {}) {
        this.close();

        const node = this.#resolveNode(src, type);
        if (!node) return null;

        if (this.#backdropNode && showBackdrop) this.#backdropNode.classList.add(ModalManager.classNames.open);

        node.classList.add(ModalManager.classNames.open);
        this.#modalRegistry.set(node, { isOpen: true, type });
        this.#mountFocusGuards(node);
        ScrollManager.lock();

        if (autoCloseAfterMs) window.setTimeout(() => this.close(node), autoCloseAfterMs);

        return node;
    }

    close(targetNode = null, { hideBackdrop = true } = {}) {
        const [openNode] = this.getOpenModal();
        const node = targetNode || openNode;
        if (!node) return;

        const state = this.#modalRegistry.get(node);
        if (!state) return;

        node.classList.remove(ModalManager.classNames.open);

        if (state.type === "html") {
            node.remove();
        }

        this.#modalRegistry.delete(node);

        if (hideBackdrop && this.#backdropNode) this.#backdropNode.classList.remove(ModalManager.classNames.open);

        this.#unmountFocusGuards(node);
        ScrollManager.unlock();
    }

    #attachGlobalListeners() {
        document.addEventListener("click", this.#onDocumentClick);
        document.addEventListener("keydown", this.#onDocumentKeydown);
    }

    #onDocumentClick = (event) => {
        const closer = event.target.closest && event.target.closest(`[${ModalManager.dataAttrs.closeTrigger}]`);
        if (closer) {
            this.close();
            return;
        }

        const trigger = event.target.closest && event.target.closest(`[${ModalManager.dataAttrs.openTrigger}]`);
        if (trigger) {
            const src = trigger.getAttribute(ModalManager.dataAttrs.openTrigger);
            const type = trigger.getAttribute(ModalManager.dataAttrs.modalType);
            if (src && type) this.open({ src, type });
            return;
        }

        const [openNode] = this.getOpenModal();
        if (openNode && !openNode.contains(event.target)) this.close();
    };

    #onDocumentKeydown = (event) => {
        if (event.key === "Escape") this.close();
    };

    #resolveNode(src, type) {
        if (type === "selector") return document.querySelector(src);
        if (type === "html" && typeof src === "string") return this.#createFromHtml(src);
        return null;
    }

    #createFromHtml(html) {
        const node = document.createElement("div");
        node.classList.add(ModalManager.classNames.base);
        node.innerHTML = html;
        document.body.appendChild(node);
        return node;
    }

    #mountFocusGuards(container) {
        const guardStart = this.#createFocusGuard("start");
        const guardEnd = this.#createFocusGuard("end");
        container.prepend(guardStart);
        container.append(guardEnd);
        container.dataset.hasFocusGuards = "true";
        container.setAttribute("tabindex", "-1");
        container.focus({ preventScroll: true });
    }

    #unmountFocusGuards(container) {
        if (!container) return;
        if (container.dataset.hasFocusGuards !== "true") return;
        [...container.querySelectorAll(`[${ModalManager.dataAttrs.focusGuard}]`)].forEach((n) => n.remove());
        container.removeAttribute("tabindex");
    }

    #createFocusGuard(position) {
        const el = document.createElement("span");
        el.setAttribute(ModalManager.dataAttrs.focusGuard, position);
        el.setAttribute("tabindex", "0");
        el.addEventListener("focus", () => {
            const focusables = this.#getFocusableElementsFromOpenModal();
            if (!focusables.length) return;
            const target = position === "start" ? focusables.at(-1) : focusables[0];
            target.focus();
        });
        return el;
    }

    #getFocusableElementsFromOpenModal() {
        const [node] = this.getOpenModal();
        if (!node) return [];
        return [...node.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]'
        )];
    }
}
