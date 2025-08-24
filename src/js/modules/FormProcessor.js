import { FormSend } from "@/js/modules/FormSend.js";

export class FormProcessor {
    #inFlight = new WeakSet();
    #modalManager;
    #senderFactory;

    static attrs = {};

    constructor({ modalManager, senderFactory } = {}) {
        this.#modalManager = modalManager;
        this.#senderFactory = senderFactory;
    }

    async process(form, submitter, config) {
        if (!form || this.#inFlight.has(form)) return;

        this.#disable(form, submitter);

        const sender = this.#resolveSender(config);

        try {
            const data = new FormData(form);
            await sender.send(form, data, {
                successModal: config.showModalAfterSuccess,
                errorModal: config.showModalAfterError,
                resetOnSuccess: Boolean(config.isResetAfterSuccess),
            });
            form.dispatchEvent(new CustomEvent("form:submitted", { bubbles: true }));
        } finally {
            this.#enable(form, submitter);
        }
    }

    #resolveSender(cfg) {
        if (typeof this.#senderFactory === "function") return this.#senderFactory(cfg);
        return new FormSend({ url: cfg.url, method: cfg.method, headers: cfg.headers || {}, modalManager: this.#modalManager, timeoutMs: cfg.timeoutMs });
    }

    #disable(form, submitter) {
        this.#inFlight.add(form);
        if (submitter) {
            submitter.setAttribute("aria-busy", "true");
            submitter.disabled = true;
        }
        form.setAttribute("aria-busy", "true");
    }

    #enable(form, submitter) {
        this.#inFlight.delete(form);
        if (submitter) {
            submitter.removeAttribute("aria-busy");
            submitter.disabled = false;
        }
        form.removeAttribute("aria-busy");
    }
}