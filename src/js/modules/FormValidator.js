export class FormValidator {
    static classes = { invalid: "isInvalid", inputInvalid: "input--invalid", valid: "isValid" };

    static attrs = {
        required: "data-js-input-required",
        requiredMode: "data-js-input-required-mode",
        errorMsg: "data-js-error-msg",
        row: "data-js-validate-row",
    };

    #debounceTimers = new WeakMap();

    constructor() {
        this.#bindEvents();
    }

    #onBlur = (e) => this.#dispatchValidation(e);
    #onFocus = (e) => this.#dispatchValidation(e);
    #onInput = (e) => this.#dispatchValidation(e);

    static isFormValid(form) {
        let ok = true;
        for (const el of form.elements) {
            if (el instanceof HTMLElement && el.matches(`[${FormValidator.attrs.required}]`)) {
                if (!FormValidator.validate(el)) ok = false;
            }
        }
        return ok;
    }

    static validate(el) {
        const type = el.getAttribute(FormValidator.attrs.required) || "text";
        const validators = {
            name: (v) => FormValidator.#validateText(v),
            text: (v) => FormValidator.#validateText(v),
            email: (v) => FormValidator.#validateEmail(v),
        };
        const messages = {
            name: "Введите корректное имя",
            email: "Введите корректный адрес электронной почты",
            text: "Это поле обязательно для заполнения",
        };
        const value = "value" in el ? String(el.value) : "";
        const isValid = (validators[type] || validators.text)(value);
        const row = el.closest(`[${FormValidator.attrs.row}]`);
        const msgNode = row?.querySelector(`[${FormValidator.attrs.errorMsg}]`);
        if (isValid) FormValidator.#hideError(row, msgNode, el);
        else FormValidator.#showError(row, msgNode, messages[type] || messages.text, el);
        return isValid;
    }

    #bindEvents() {
        document.addEventListener("blur", this.#onBlur, true);
        document.addEventListener("focus", this.#onFocus, true);
        document.addEventListener("input", this.#onInput, true);
    }

    #dispatchValidation(event) {
        const el = event.target?.closest?.(`[${FormValidator.attrs.required}]`);
        if (!el) return;

        const modes = (el.getAttribute(FormValidator.attrs.requiredMode) || "")
            .split(/\s*,\s*/)
            .filter(Boolean);

        if (event.type === "input") {
            const type = el.getAttribute(FormValidator.attrs.required);
            if (type === "email") {
                this.#debounce(el, () => FormValidator.validate(el), 300);
            } else {
                FormValidator.validate(el);
            }
            return;
        }

        if (modes.includes(event.type)) FormValidator.validate(el);
    }

    #debounce(el, fn, delay) {
        window.clearTimeout(this.#debounceTimers.get(el));
        const id = window.setTimeout(fn, delay);
        this.#debounceTimers.set(el, id);
    }

    static #validateEmail(v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim());
    }

    static #validateText(v) {
        return v.trim().length > 0;
    }

    static #showError(row, msgNode, message, input) {
        row?.classList.add(FormValidator.classes.invalid);
        input?.classList.add(FormValidator.classes.inputInvalid);
        if (msgNode) msgNode.textContent = message;
    }

    static #hideError(row, msgNode, input) {
        row?.classList.remove(FormValidator.classes.invalid);
        input?.classList.remove(FormValidator.classes.inputInvalid);
        if (msgNode) msgNode.textContent = "";
    }
}