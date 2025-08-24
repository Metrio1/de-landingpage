import { FormValidator } from "@/js/modules/FormValidator.js";
import { FormProcessor } from "@/js/modules/FormProcessor.js";

export class FormHandler {
  #modalManager;
  #processor;
  #formConfigCache = new WeakMap();

  static attrs = {
    formConfig: "data-js-form",
  };

  constructor({ modalManager, processor } = {}) {
    this.#modalManager = modalManager;
    this.#processor = processor || new FormProcessor({ modalManager });
    this.#bindEvents();
  }

  #onSubmit = (e) => this.#handleSubmit(e);

  #bindEvents() {
    document.addEventListener("submit", this.#onSubmit, true);
  }

  async #handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const submitter = event.submitter || this.#resolveSubmitter(form);
    const cfg = this.#readConfig(form);

    if (cfg?.isNeedPreventDefault !== false) event.preventDefault();

    const needsValidation = cfg?.isNeedValidateBeforeSubmit !== false;
    if (needsValidation && !FormValidator.isFormValid(form)) return;

    await this.#processor.process(form, submitter, cfg);
  }

  #resolveSubmitter(form) {
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

  #readConfig(form) {
    if (this.#formConfigCache.has(form)) return this.#formConfigCache.get(form);
    const raw = form.getAttribute(FormHandler.attrs.formConfig) || "{}";
    let parsed = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const normalized = {
      url: parsed.url || form.getAttribute("action") || window.location.href,
      method: (parsed.method || form.getAttribute("method") || "POST").toUpperCase(),
      headers: parsed.headers || {},
      timeoutMs: Number(parsed.timeoutMs) || 15000,
      showModalAfterSuccess: parsed.showModalAfterSuccess,
      showModalAfterError: parsed.showModalAfterError,
      isResetAfterSuccess: Boolean(parsed.isResetAfterSuccess),
      isNeedPreventDefault: parsed.isNeedPreventDefault !== false,
      isNeedValidateBeforeSubmit: parsed.isNeedValidateBeforeSubmit !== false,
    };
    this.#formConfigCache.set(form, normalized);
    return normalized;
  }
}