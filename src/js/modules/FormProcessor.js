import { FormSend } from "@/js/modules/FormSend.js";

export class FormProcessor {
    #modalManager;
    #isSubmittingForms = new Set();
    #formSend;

    constructor(modalManager, formSend = null) {
        this.#modalManager = modalManager;
        this.#formSend = formSend;
    }

    async process(form, submitter, formConfig) {
        if (this.#isSubmittingForms.has(form)) {
            return;
        }

        this.#disableForm(form, submitter);

        const formSender = this.#formSend || new FormSend(
            formConfig.url,
            formConfig.method,
            {},
            this.#modalManager
        );

        try {
            await formSender.sendData(form, new FormData(form), {
                showModalAfterSuccess: formConfig.showModalAfterSuccess,
                showModalAfterError: formConfig.showModalAfterError,
                isResetAfterSuccess: formConfig.isResetAfterSuccess,
            });
        } finally {
            this.#enableForm(form, submitter);
        }
    }

    #disableForm(form, submitter) {
        this.#isSubmittingForms.add(form);
        submitter.disabled = true;
    }

    #enableForm(form, submitter) {
        this.#isSubmittingForms.delete(form);
        submitter.disabled = false;
    }
}