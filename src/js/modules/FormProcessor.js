import { FormSend } from "@/js/modules/FormSend.js";

export class FormProcessor {
    #activeForms = new WeakSet();
    #modalManager;
    #senderFactory;

    constructor({ modalManager, senderFactory } = {}) {
        this.#modalManager = modalManager;
        this.#senderFactory = senderFactory;
    }

    async process(form, submitButton, config) {
        if (!form || this.#activeForms.has(form)) return;

        this.#lockForm(form, submitButton);

        const sender = this.#createSender(config);

        try {
            const formData = new FormData(form);
            await sender.send(form, formData, {
                successModal: config.successModalId,
                errorModal: config.errorModalId,
                resetOnSuccess: Boolean(config.resetFormOnSuccess),
            });
            form.dispatchEvent(new CustomEvent("form:submitted", { bubbles: true }));
        } finally {
            this.#unlockForm(form, submitButton);
        }
    }

    #createSender(config) {
        if (typeof this.#senderFactory === "function") {
            return this.#senderFactory(config);
        }
        return new FormSend({
            url: config.url,
            method: config.method,
            headers: config.headers || {},
            modalManager: this.#modalManager,
            timeoutMs: config.timeoutMs,
        });
    }

    #lockForm(form, submitButton) {
        this.#activeForms.add(form);
        if (submitButton) {
            submitButton.setAttribute("aria-busy", "true");
            submitButton.disabled = true;
        }
        form.setAttribute("aria-busy", "true");
    }

    #unlockForm(form, submitButton) {
        this.#activeForms.delete(form);
        if (submitButton) {
            submitButton.removeAttribute("aria-busy");
            submitButton.disabled = false;
        }
        form.removeAttribute("aria-busy");
    }
}
