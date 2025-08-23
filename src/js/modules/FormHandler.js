import { FormValidator } from "@/js/modules/FormValidator.js";
import { ModalManager } from "@/js/modules/ModalManager.js";
import { FormProcessor } from "@/js/modules/FormProcessor.js";
import { ATTRS, FORM_DEFAULTS } from "@/js/constants.js";

export class FormHandler {
  static attrs = ATTRS;
  static defaults = FORM_DEFAULTS;

  #processor;
  #configCache = new WeakMap();
  #onSubmitBound = (e) => this.#onSubmit(e);

  constructor(modalManager = new ModalManager(), formProcessor = null) {
    this.#processor =
        formProcessor ||
        new FormProcessor({
          modalManager,
        });

    document.addEventListener("submit", this.#onSubmitBound, true);
  }

  #onSubmit(event) {
    const { target: form, submitter } = event;
    if (!(form instanceof HTMLFormElement)) return;

    const cfg = this.#getFormConfig(form);
    if (cfg.isNeedPreventDefault) {
      event.preventDefault();
    }

    if (!FormValidator.isValidForm(form, FormHandler.attrs, cfg.isNeedValidateBeforeSubmit)) {
      return;
    }

    this.#processor.process(form, submitter || null, cfg);
  }

  #getFormConfig(form) {
    if (this.#configCache.has(form)) {
      return this.#configCache.get(form);
    }

    const raw = form.getAttribute(FormHandler.attrs.form) || "{}";
    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const d = FormHandler.defaults;
    const merged = {
      isNeedPreventDefault: parsed.isNeedPreventDefault ?? d.isNeedPreventDefault,
      isNeedValidateBeforeSubmit: parsed.isNeedValidateBeforeSubmit ?? d.isNeedValidateBeforeSubmit,

      request: {
        url: parsed.request?.url ?? parsed.url ?? d.request.url,
        method: (parsed.request?.method ?? parsed.method ?? d.request.method).toUpperCase(),
        headers: { ...(d.request.headers || {}), ...(parsed.request?.headers || parsed.headers || {}) },
      },

      showModalAfterSuccess: parsed.showModalAfterSuccess ?? d.showModalAfterSuccess,
      showModalAfterError: parsed.showModalAfterError ?? d.showModalAfterError,
      isResetAfterSuccess: parsed.isResetAfterSuccess ?? d.isResetAfterSuccess,

      isNeedShowBackdrop: parsed.isNeedShowBackdrop ?? d.isNeedShowBackdrop,
      closeAfterDelaySuccess: parsed.closeAfterDelaySuccess ?? d.closeAfterDelaySuccess,
      closeAfterDelayError: parsed.closeAfterDelayError ?? d.closeAfterDelayError,
    };

    this.#configCache.set(form, merged);
    return merged;
  }
}
