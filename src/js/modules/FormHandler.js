import { FormValidator } from "@/js/modules/FormValidator.js";
import { ModalManager } from "@/js/modules/ModalManager.js";
import { FormProcessor } from "@/js/modules/FormProcessor.js";

export class FormHandler {
  static instance;
  #modalManager;
  #formProcessor;

  attrs = {
    form: "data-js-form",
  };

  constructor(modalManager = new ModalManager(), formProcessor = null, formSend = null) {
    if (FormHandler.instance) {
      return FormHandler.instance;
    }

    this.#modalManager = modalManager;
    this.#formProcessor = formProcessor || new FormProcessor(modalManager, formSend);
    this.#bindEvents();
    FormHandler.instance = this;
  }

  async #handleSubmit(event) {
    const { target, submitter } = event;
    const formConfig = this.#prepareConfig(target);

    const { isNeedPreventDefault = true, isNeedValidateBeforeSubmit = true } = formConfig;

    if (isNeedPreventDefault) {
      event.preventDefault();
    }

    if (!FormValidator.isValidForm(target, this.attrs, isNeedValidateBeforeSubmit)) {
      return;
    }

    await this.#formProcessor.process(target, submitter, formConfig);
  }

  #prepareConfig(form) {
    if (!form._config) {
      form._config = JSON.parse(form.getAttribute(this.attrs.form));
    }
    return form._config;
  }

  #bindEvents() {
    document.addEventListener("submit", (e) => this.#handleSubmit(e), true);
  }
}