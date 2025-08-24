export class FormValidator {
    static classNames = {
        rowInvalid: "isInvalid",
        inputInvalid: "input--invalid",
        rowValid: "isValid",
    };

    static dataAttrs = {
        requiredType: "data-js-input-required",
        triggerMode: "data-js-input-required-mode",
        errorMessage: "data-js-error-msg",
        validationRow: "data-js-validate-row",
    };

    #debounceTimers = new WeakMap();

    constructor() {
        this.#attachGlobalListeners();
    }

    static isFormValid(form) {
        let allValid = true;
        for (const element of form.elements) {
            if (element instanceof HTMLElement && element.matches(`[${FormValidator.dataAttrs.requiredType}]`)) {
                if (!FormValidator.validate(element)) allValid = false;
            }
        }
        return allValid;
    }

    static validate(element) {
        const type = element.getAttribute(FormValidator.dataAttrs.requiredType) || "text";
        const validatorFn = FormValidator.#selectValidator(type);
        const messages = FormValidator.#defaultMessages();
        const value = "value" in element ? String(element.value) : "";

        const isValid = validatorFn(value);
        const row = element.closest(`[${FormValidator.dataAttrs.validationRow}]`);
        const msgNode = row?.querySelector(`[${FormValidator.dataAttrs.errorMessage}]`);

        if (isValid) FormValidator.#clearFieldError(row, msgNode, element);
        else FormValidator.#showFieldError(row, msgNode, messages[type] || messages.text, element);

        return isValid;
    }

    #attachGlobalListeners() {
        document.addEventListener("blur", this.#handleFieldEvent, true);
        document.addEventListener("focus", this.#handleFieldEvent, true);
        document.addEventListener("input", this.#handleFieldEvent, true);
    }

    #handleFieldEvent = (event) => {
        const el = event.target?.closest?.(`[${FormValidator.dataAttrs.requiredType}]`);
        if (!el) return;

        const modes = (el.getAttribute(FormValidator.dataAttrs.triggerMode) || "")
            .split(/\s*,\s*/)
            .filter(Boolean);

        if (event.type === "input") {
            const requiredType = el.getAttribute(FormValidator.dataAttrs.requiredType);
            if (requiredType === "email") {
                this.#debounce(el, () => FormValidator.validate(el), 300);
            } else {
                FormValidator.validate(el);
            }
            return;
        }

        if (modes.includes(event.type)) FormValidator.validate(el);
    };

    #debounce(el, fn, delay) {
        window.clearTimeout(this.#debounceTimers.get(el));
        const id = window.setTimeout(fn, delay);
        this.#debounceTimers.set(el, id);
    }

    static #selectValidator(type) {
        const validators = {
            name: (v) => FormValidator.#validateNonEmptyText(v),
            text: (v) => FormValidator.#validateNonEmptyText(v),
            email: (v) => FormValidator.#validateEmail(v),
        };
        return validators[type] || validators.text;
    }

    static #defaultMessages() {
        return {
            name: "Введите корректное имя",
            email: "Введите корректный адрес электронной почты",
            text: "Это поле обязательно для заполнения",
        };
    }

    static #validateEmail(value) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim());
    }

    static #validateNonEmptyText(value) {
        return value.trim().length > 0;
    }

    static #showFieldError(row, msgNode, message, input) {
        row?.classList.add(FormValidator.classNames.rowInvalid);
        input?.classList.add(FormValidator.classNames.inputInvalid);
        if (msgNode) msgNode.textContent = message;
    }

    static #clearFieldError(row, msgNode, input) {
        row?.classList.remove(FormValidator.classNames.rowInvalid);
        input?.classList.remove(FormValidator.classNames.inputInvalid);
        if (msgNode) msgNode.textContent = "";
    }
}
