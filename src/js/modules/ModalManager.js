import { ScrollManager } from "@/js/utils/ScrollManager.js";

export class ModalManager {
    static classes = {
        open: "isOpen",
        base: "modal",
    };

    static attrs = {
        openTrigger: "data-js-modal-open",
        type: "data-js-modal-type",
        closeTrigger: "data-js-modal-close",
        backdrop: "data-js-modal-backdrop",
        focusGuard: "data-js-focus-guard",
    };

    #instances = new Map();
    #backdrop = null;

    constructor() {
        this.#backdrop = document.querySelector(`[${ModalManager.attrs.backdrop}]`);
        this.#bindEvents();
    }

    #onClick = (e) => this.#handleClick(e);
    #onKeydown = (e) => this.#handleKeydown(e);

    getOpenInstance() {
        for (const [el, state] of this.#instances.entries()) {
            if (state.isOpen) return [el, state];
        }
        return [null, null];
    }

    open({ src, type, showBackdrop = true, autoCloseAfterMs } = {}) {
        this.close();
        const node = this.#resolveModalNode(src, type);
        if (!node) return null;

        if (this.#backdrop && showBackdrop) {
            this.#backdrop.classList.add(ModalManager.classes.open);
        }

        node.classList.add(ModalManager.classes.open);
        this.#instances.set(node, { isOpen: true, type });
        this.#trapFocus(node);
        ScrollManager.lock();

        if (autoCloseAfterMs) {
            window.setTimeout(() => this.close(node), autoCloseAfterMs);
        }
        return node;
    }

    close(targetNode = null, { hideBackdrop = true } = {}) {
        const [current] = this.getOpenInstance();
        const node = targetNode || current;
        if (!node) return;

        const state = this.#instances.get(node);
        if (!state) return;

        node.classList.remove(ModalManager.classes.open);

        if (state.type === "html") {
            node.remove();
        }

        this.#instances.delete(node);

        if (hideBackdrop && this.#backdrop) {
            this.#backdrop.classList.remove(ModalManager.classes.open);
        }

        this.#releaseFocus();
        ScrollManager.unlock();
    }

    #bindEvents() {
        document.addEventListener("click", this.#onClick);
        document.addEventListener("keydown", this.#onKeydown);
    }

    #handleClick(event) {
        const closer = event.target.closest(`[${ModalManager.attrs.closeTrigger}]`);
        if (closer) {
            this.close();
            return;
        }

        const trigger = event.target.closest(`[${ModalManager.attrs.openTrigger}]`);
        if (trigger) {
            const src = trigger.getAttribute(ModalManager.attrs.openTrigger);
            const type = trigger.getAttribute(ModalManager.attrs.type);
            if (src && type) this.open({ src, type });
            return;
        }

        const [openEl] = this.getOpenInstance();
        if (openEl && !openEl.contains(event.target)) this.close();
    }

    #handleKeydown(event) {
        if (event.key === "Escape") this.close();
    }

    #resolveModalNode(src, type) {
        if (type === "selector") return document.querySelector(src);
        if (type === "html" && typeof src === "string") return this.#createModal(src);
        return null;
    }

    #createModal(html) {
        const modal = document.createElement("div");
        modal.classList.add(ModalManager.classes.base);
        modal.innerHTML = html;
        document.body.appendChild(modal);
        return modal;
    }

    #trapFocus(container) {
        const guards = [
            this.#createFocusGuard("start"),
            this.#createFocusGuard("end"),
        ];
        container.prepend(guards[0]);
        container.append(guards[1]);
        container.dataset.hasFocusGuards = "true";
        container.setAttribute("tabindex", "-1");
        container.focus({ preventScroll: true });
    }

    #releaseFocus() {
        const [node] = this.getOpenInstance();
        const container = node || document.querySelector(`.${ModalManager.classes.base}.${ModalManager.classes.open}`);
        if (!container) return;
        if (container.dataset.hasFocusGuards !== "true") return;
        [...container.querySelectorAll(`[${ModalManager.attrs.focusGuard}]`)].forEach((g) => g.remove());
        container.removeAttribute("tabindex");
    }

    #createFocusGuard(position) {
        const el = document.createElement("span");
        el.setAttribute(ModalManager.attrs.focusGuard, position);
        el.setAttribute("tabindex", "0");
        el.addEventListener("focus", () => {
            const focusables = this.#getFocusableElements();
            if (!focusables.length) return;
            const target = position === "start" ? focusables.at(-1) : focusables[0];
            target.focus();
        });
        return el;
    }

    #getFocusableElements() {
        const [node] = this.getOpenInstance();
        if (!node) return [];
        return [...node.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]'
        )];
    }
}