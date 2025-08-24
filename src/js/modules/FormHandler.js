import { FormValidator } from "@/js/modules/FormValidator.js";
import { FormProcessor } from "@/js/modules/FormProcessor.js";

export class FormHandler {
  #modalManager;
  #formProcessor;
  #formConfigCache = new WeakMap();

  static attributes = {
    formConfig: "data-js-form",
  };

  constructor({ modalManager, processor } = {}) {
    this.#modalManager = modalManager;
    this.#formProcessor = processor || new FormProcessor({ modalManager });
    this.#initEventListeners();
  }

  #handleFormSubmit = (event) => this.#processFormSubmission(event);

  #initEventListeners() {
    document.addEventListener("submit", this.#handleFormSubmit, true);
  }

  async #processFormSubmission(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const submitButton = event.submitter || this.#findSubmitButton(form);
    const config = this.#getFormConfig(form);

    if (config?.preventDefaultOnSubmit !== false) event.preventDefault();

    const shouldValidate = config?.validateBeforeSubmit !== false;
    if (shouldValidate && !FormValidator.isFormValid(form)) return;

    await this.#formProcessor.process(form, submitButton, config);
  }

  #findSubmitButton(form) {
    const id = form.getAttribute("id");
    const selectorInternal = "button[type=submit], input[type=submit]";
    const selectorExternal = id
        ? `${selectorInternal}[form="${CSS.escape(id)}"]`
        : null;

    return (
        form.querySelector(selectorInternal) ||
        (selectorExternal ? document.querySelector(selectorExternal) : null)
    );
  }

  #getFormConfig(form) {
    if (this.#formConfigCache.has(form)) return this.#formConfigCache.get(form);

    const rawConfig = form.getAttribute(FormHandler.attributes.formConfig) || "{}";
    let parsedConfig = {};
    try {
      parsedConfig = JSON.parse(rawConfig);
    } catch {
      parsedConfig = {};
    }

    const normalizedConfig = {
      url: parsedConfig.url || form.getAttribute("action") || window.location.href,
      method: (parsedConfig.method || form.getAttribute("method") || "POST").toUpperCase(),
      headers: parsedConfig.headers || {},
      timeoutMs: Number(parsedConfig.timeoutMs) || 15000,
      successModalId: parsedConfig.showModalAfterSuccess,
      errorModalId: parsedConfig.showModalAfterError,
      resetFormOnSuccess: Boolean(parsedConfig.isResetAfterSuccess),
      preventDefaultOnSubmit: parsedConfig.isNeedPreventDefault !== false,
      validateBeforeSubmit: parsedConfig.isNeedValidateBeforeSubmit !== false,
    };

    this.#formConfigCache.set(form, normalizedConfig);
    return normalizedConfig;
  }
}
