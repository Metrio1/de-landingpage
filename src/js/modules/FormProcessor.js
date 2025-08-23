import { FormSend } from "@/js/modules/FormSend.js";
import { ModalManager } from "@/js/modules/ModalManager.js";

/**
 * Отвечает только за:
 *  - конкурентный контроль (1 запрос на форму)
 *  - включение/отключение доступности элементов формы
 *  - вызов транспорта (FormSend)
 *  - UI-фидбек через стратегию (по умолчанию — модалки)
 *  - генерацию событий form:success / form:error
 */
export class FormProcessor {
    #sender;
    #modalManager;
    #inFlight = new WeakSet();

    constructor({
                    sender = new FormSend(),
                    modalManager = new ModalManager(),
                } = {}) {
        this.#sender = sender;
        this.#modalManager = modalManager;
    }

    async process(form, submitter, cfg) {
        if (this.#inFlight.has(form)) return;

        this.#disableForm(form, submitter);
        try {
            const fd = new FormData(form);
            const { url, method, headers } = cfg.request;

            const result = await this.#sender.send(url, method, fd, headers);

            // Успех
            if (cfg.isResetAfterSuccess) {
                form.reset();
            }

            if (cfg.showModalAfterSuccess) {
                this.#modalManager.open({
                    src: cfg.showModalAfterSuccess,
                    type: "selector",
                    isNeedShowBackdrop: cfg.isNeedShowBackdrop,
                    closeAfterDelay: cfg.closeAfterDelaySuccess,
                });
            }

            form.dispatchEvent(
                new CustomEvent("form:success", {
                    bubbles: true,
                    detail: { form, data: result.data, status: result.status },
                })
            );
        } catch (error) {
            if (cfg.showModalAfterError) {
                this.#modalManager.open({
                    src: cfg.showModalAfterError,
                    type: "selector",
                    isNeedShowBackdrop: cfg.isNeedShowBackdrop,
                    closeAfterDelay: cfg.closeAfterDelayError,
                });
            }

            form.dispatchEvent(
                new CustomEvent("form:error", {
                    bubbles: true,
                    detail: { form, error },
                })
            );
        } finally {
            this.#enableForm(form, submitter);
        }
    }

    #disableForm(form, submitter) {
        this.#inFlight.add(form);
        const controls = this.#getSubmitControls(form, submitter);
        controls.forEach((el) => el.setAttribute("disabled", "true"));
    }

    #enableForm(form, submitter) {
        this.#inFlight.delete(form);
        const controls = this.#getSubmitControls(form, submitter);
        controls.forEach((el) => el.removeAttribute("disabled"));
    }

    #getSubmitControls(form, submitter) {
        if (submitter instanceof HTMLElement) return [submitter];
        return Array.from(form.querySelectorAll('[type="submit"], [data-js-submit]'));
    }
}
