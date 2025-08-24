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
            this.#onSuccess({ form, successModal, resetOnSuccess });
            return payload;
        } catch (err) {
            this.#onError({ errorModal });
            throw err;
        }
    }

    #buildRequest(formData) {
        const init = {
            method: this.#method,
            headers: { Accept: "application/json", ...this.#headers },
        };

        if (this.#method === "GET") {
            const url = new URL(this.#url, window.location.origin);
            const params = new URLSearchParams(formData);
            url.search = params.toString();
            return { url: url.toString(), init };
        }

        return { url: this.#url, init: { ...init, body: formData } };
    }

    async #fetchWithTimeout({ url, init }) {
        const controller = new AbortController();
        const id = window.setTimeout(() => controller.abort(), this.#timeoutMs);
        try {
            const res = await fetch(url, { ...init, signal: controller.signal });
            if (!res.ok) throw new Error(String(res.status || "NETWORK"));
            return res;
        } finally {
            window.clearTimeout(id);
        }
    }

    async #parseJson(response) {
        try {
            return await response.json();
        } catch {
            return {};
        }
    }

    #onSuccess({ form, successModal, resetOnSuccess }) {
        if (resetOnSuccess) form.reset();
        if (successModal) this.#openModal(successModal, false, 2000);
        ScrollManager.unlock();
        form.dispatchEvent(new CustomEvent("form:success", { bubbles: true }));
    }

    #onError({ errorModal }) {
        if (errorModal) this.#openModal(errorModal, true, 3000);
        ScrollManager.unlock();
        document.dispatchEvent(new CustomEvent("form:error", { bubbles: true }));
    }

    #openModal(src, showBackdrop, closeAfterMs) {
        this.#modalManager.open({ src, type: "selector", showBackdrop, autoCloseAfterMs: closeAfterMs });
    }
}