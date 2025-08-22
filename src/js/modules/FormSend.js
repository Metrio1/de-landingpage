import { ModalManager } from "./ModalManager.js";
import { ScrollManager } from "@/js/utils/ScrollManager.js";

export class FormSend {
    #url;
    #method;
    #headers;
    #modalManager;

    constructor(url, method = "POST", headers = {}, modalManagerInstance = null) {
        this.#url = url;
        this.#method = method.toUpperCase();
        this.#headers = headers;
        this.#modalManager = modalManagerInstance || new ModalManager();
    }

    async sendData(form, formData, { showModalAfterSuccess, showModalAfterError, isResetAfterSuccess }) {
        try {
            const response = await fetch(this.#url, this.#getRequestOptions(formData));
            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            this.#handleSuccess(form, showModalAfterSuccess, isResetAfterSuccess);
            return result;
        } catch (error) {
            this.#handleError(error, showModalAfterError);
            throw error;
        }
    }

    #getRequestOptions(formData) {
        const options = {
            method: this.#method,
            headers: {
                "Accept": "application/json",
                ...this.#headers,
            },
        };

        if (this.#method !== "GET") {
            options.body = formData;
        }

        return options;
    }

    #handleSuccess(form, showModalAfterSuccess, isResetAfterSuccess) {
        if (isResetAfterSuccess) {
            form.reset();
        }

        this.#openModal(showModalAfterSuccess, false, 2000);
    }

    #handleError(error, showModalAfterError) {
        console.error("Ошибка при отправке данных:", error);

        this.#openModal(showModalAfterError, true, 3000);
    }

    #openModal(src, isNeedShowBackdrop, closeAfterDelay) {
        if (src) {
            this.#modalManager.open({
                src,
                type: "selector",
                isNeedShowBackdrop,
                closeAfterDelay,
            });
        }
        ScrollManager.unlock();
    }
}