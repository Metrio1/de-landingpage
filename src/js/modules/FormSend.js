import { ModalManager } from "@/js/modules/ModalManager.js";
import { ScrollManager } from "@/js/utils/ScrollManager.js";

export class FormSend {
    #url;
    #method;
    #headers;
    #modalManager;
    #timeoutMs;

    constructor({ url, method = "POST", headers = {}, modalManager = null, timeoutMs = 15000 } = {}) {
        this.#url = url;
        this.#method = String(method).toUpperCase();
        this.#headers = headers;
        this.#modalManager = modalManager || new ModalManager();
        this.#timeoutMs = timeoutMs;
    }

    async send(form, formData, { successModal, errorModal, resetOnSuccess } = {}) {
        const request = this.#buildRequest(formData);

        try {
            const response = await this.#fetchWithTimeout(request);
            const payload = await this.#parseJson(response);
            this.#handleSuccess({ form, successModal, resetOnSuccess });
            return payload;
        } catch (err) {
            this.#handleError({ errorModal });
            throw err;
        }
    }

    #buildRequest(formData) {
        const requestInit = {
            method: this.#method,
            headers: { Accept: "application/json", ...this.#headers },
        };

        if (this.#method === "GET") {
            const url = new URL(this.#url, window.location.origin);
            url.search = new URLSearchParams(formData).toString();
            return { url: url.toString(), init: requestInit };
        }

        return { url: this.#url, init: { ...requestInit, body: formData } };
    }

    async #fetchWithTimeout({ url, init }) {
        const controller = new AbortController();
        const timerId = window.setTimeout(() => controller.abort(), this.#timeoutMs);

        try {
            const response = await fetch(url, { ...init, signal: controller.signal });
            if (!response.ok) throw new Error(String(response.status || "NETWORK"));
            return response;
        } finally {
            window.clearTimeout(timerId);
        }
    }

    async #parseJson(response) {
        try {
            return await response.json();
        } catch {
            return {};
        }
    }

    #handleSuccess({ form, successModal, resetOnSuccess }) {
        if (resetOnSuccess) form.reset();
        if (successModal) this.#showModal(successModal, false, 2000);

        ScrollManager.unlock();
        form.dispatchEvent(new CustomEvent("form:success", { bubbles: true }));
    }

    #handleError({ errorModal }) {
        if (errorModal) this.#showModal(errorModal, true, 3000);

        ScrollManager.unlock();
        document.dispatchEvent(new CustomEvent("form:error", { bubbles: true }));
    }

    #showModal(selectorOrHtml, showBackdrop, autoCloseAfterMs) {
        this.#modalManager.open({
            src: selectorOrHtml,
            type: "selector",
            showBackdrop,
            autoCloseAfterMs,
        });
    }
}
