import { ScrollManager } from "../utils/ScrollManager.js";

export class ModalManager {
    static stateClasses = {
        isOpen: "isOpen",
        baseClass: "modal",
    };

    static attrs = {
        triggerOpen: "data-js-modal-open",
        modalType: "data-js-modal-type",
        modalClose: "data-js-modal-close",
    };

    #backdrop;
    #instances = new Map();

    constructor() {
        this.#backdrop = document.querySelector("[data-js-modal-backdrop]");
        this.#bindEvents();
    }

    #bindEvents() {
        document.addEventListener("click", (e) => this.#handleClick(e));
        document.addEventListener("keydown", (e) => this.#handleKeyDown(e));
    }

    #handleClick(event) {
        const modalCloseElement = event.target.closest(`[${ModalManager.attrs.modalClose}]`);
        const target = event.target.closest(`[${ModalManager.attrs.triggerOpen}]`);

        if (target) {
            const src = target.getAttribute(ModalManager.attrs.triggerOpen);
            const type = target.getAttribute(ModalManager.attrs.modalType);
            src && type
                ? this.open({ src, type })
                : console.error("Отсутствуют или некорректны атрибуты для открытия модального окна:", src, type);
        } else if (modalCloseElement) {
            this.close();
        } else {
            const [ openInstance ] = this.getOpenInstance();
            if (openInstance && !openInstance.contains(event.target)) {
                this.close();
            }
        }
    }

    #handleKeyDown(event) {
        if (event.key === "Escape") {
            this.close();
        }
    }

    getOpenInstance() {
        for (const [ element, state ] of this.#instances.entries()) {
            if (state.isOpen) {
                return [ element, state ];
            }
        }
        return [ null, null ];
    }

    open({ src, type, isNeedShowBackdrop = true, closeAfterDelay } = {}) {
        this.close();

        const modalElement = this.#getModalElement(src, type);
        if (!modalElement) {
            return null;
        }

        if (this.#backdrop && isNeedShowBackdrop) {
            this.#backdrop.classList.add(ModalManager.stateClasses.isOpen);
        }

        modalElement.classList.add(ModalManager.stateClasses.isOpen);
        this.#instances.set(modalElement, { isOpen: true, type });
        this.#scrollLock();

        if (closeAfterDelay) {
            setTimeout(() => this.close(modalElement), closeAfterDelay);
        }

        return modalElement;
    }

    #getModalElement(src, type) {
        if (type === "selector") {
            return document.querySelector(src);
        } else if (type === "html" && typeof src === "string") {
            return this.#createModal(src);
        } else {
            console.error("Неверный источник или тип модального окна:", src, type);
            return null;
        }
    }

    #createModal(html) {
        const modalElement = document.createElement("div");
        modalElement.classList.add(ModalManager.stateClasses.baseClass);
        modalElement.innerHTML = html;
        document.body.appendChild(modalElement);
        return modalElement;
    }

    close(modalElement = null, { isNeedCloseBackdrop = true } = {}) {
        const [ openInstance ] = this.getOpenInstance();
        const modalToClose = modalElement || openInstance;

        if (!modalToClose) {
            return;
        }

        const state = this.#instances.get(modalToClose);
        if (!state) {
            return;
        }

        if (isNeedCloseBackdrop && this.#backdrop) {
            this.#backdrop.classList.remove(ModalManager.stateClasses.isOpen);
        }

        modalToClose.classList.remove(ModalManager.stateClasses.isOpen);
        if (state.type === "html") {
            document.body.removeChild(modalToClose);
        }
        this.#instances.delete(modalToClose);
        this.#scrollUnlock();
    }

    #scrollLock() {
        ScrollManager.lock();
    }

    #scrollUnlock() {
        ScrollManager.unlock();
    }
}