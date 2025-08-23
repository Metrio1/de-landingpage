import { ScrollManager } from "@/js/utils/ScrollManager.js";
import { STATE_CLASSES, ATTRS, MODAL_BACKDROP_SELECTOR } from "@/js/constants.js";

export class ModalManager {
    static stateClasses = STATE_CLASSES;
    static attrs = ATTRS;

    #backdrop;
    #instances = new Map();
    #onClickBound = (e) => this.#onClick(e);
    #onKeydownBound = (e) => this.#onKeydown(e);

    constructor({ backdropSelector = MODAL_BACKDROP_SELECTOR, autoBind = true } = {}) {
        this.#backdrop = document.querySelector(backdropSelector) || null;
        if (autoBind) {
            document.addEventListener("click", this.#onClickBound, true);
            document.addEventListener("keydown", this.#onKeydownBound, true);
        }
    }

    #onClick(event) {
        const closeEl = event.target.closest?.(`[${ATTRS.modalClose}]`);
        const trigger = event.target.closest?.(`[${ATTRS.modalOpen}]`);

        if (trigger) {
            const src = trigger.getAttribute(ATTRS.modalOpen);
            const type = trigger.getAttribute(ATTRS.modalType);
            if (src && type) this.open({ src, type });
            return;
        }

        if (closeEl) {
            this.close();
            return;
        }

        const [openModal] = this.getOpenInstance();
        if (openModal && !openModal.contains(event.target)) {
            this.close();
        }
    }

    #onKeydown(event) {
        if (event.key === "Escape") this.close();
    }

    getOpenInstance() {
        for (const [el, state] of this.#instances.entries()) {
            if (state.isOpen) return [el, state];
        }
        return [null, null];
    }

    open({ src, type, isNeedShowBackdrop = true, closeAfterDelay } = {}) {
        this.close();

        const modal = this.#resolveModal(src, type);
        if (!modal) return null;

        if (this.#backdrop && isNeedShowBackdrop) {
            this.#backdrop.classList.add(STATE_CLASSES.isOpen);
        }

        modal.classList.add(STATE_CLASSES.isOpen);
        this.#instances.set(modal, { isOpen: true, type });
        ScrollManager.lock();

        if (closeAfterDelay) {
            setTimeout(() => this.close(modal), closeAfterDelay);
        }
        return modal;
    }

    #resolveModal(src, type) {
        if (type === "selector") {
            return document.querySelector(src);
        }
        if (type === "html" && typeof src === "string") {
            const el = document.createElement("div");
            el.classList.add(STATE_CLASSES.baseModal);
            el.innerHTML = src;
            document.body.appendChild(el);
            return el;
        }
        return null;
    }

    close(target = null, { isNeedCloseBackdrop = true } = {}) {
        const [openModal] = this.getOpenInstance();
        const modal = target || openModal;
        if (!modal) return;

        const state = this.#instances.get(modal);
        if (!state) return;

        if (isNeedCloseBackdrop && this.#backdrop) {
            this.#backdrop.classList.remove(STATE_CLASSES.isOpen);
        }

        modal.classList.remove(STATE_CLASSES.isOpen);
        if (state.type === "html") {
            document.body.removeChild(modal);
        }
        this.#instances.delete(modal);
        ScrollManager.unlock();
    }
}
