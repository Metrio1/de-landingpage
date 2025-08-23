import { ATTRS, STATE_CLASSES, VALIDATOR_DEFAULTS, VALIDATOR_ERRORS } from "@/js/constants.js";

export class FormValidator {
    static attrs = ATTRS;
    static stateClasses = STATE_CLASSES;
    static defaults = VALIDATOR_DEFAULTS;

    constructor() {
        this.#bind();
    }

    #bind() {
        document.addEventListener("blur", FormValidator.#handleEvent, true);
        document.addEventListener("focus", FormValidator.#handleEvent, true);
        document.addEventListener("input", FormValidator.#handleEvent, true);
    }

    static #handleEvent(event) {
        const input = event.target?.closest?.(`[${ATTRS.inputRequired}]`);
        if (!input) return;

        const modesAttr = input.getAttribute(ATTRS.inputRequiredMode);
        const modes = modesAttr ? modesAttr.trim().split(/\s*,\s*/) : [];
        if (!(modes.includes(event.type) || event.type === "input")) return;

        const debounceAttr = input.getAttribute(ATTRS.debounceMs);
        const debounceMs = Number.isFinite(+debounceAttr) ? +debounceAttr : VALIDATOR_DEFAULTS.debounceMs;

        if (debounceMs > 0) {
            clearTimeout(input.__fvTimer);
            input.__fvTimer = setTimeout(() => {
                FormValidator.validateInput(input);
            }, debounceMs);
        } else {
            FormValidator.validateInput(input);
        }
    }

    static isValidForm(form, attrs, needValidate) {
        if (!(form instanceof HTMLFormElement)) return false;
        if (!form.hasAttribute(attrs.form)) return false;

        if (!needValidate) return true;

        let ok = true;
        const list = form.querySelectorAll(`[${ATTRS.inputRequired}]`);
        list.forEach((input) => {
            if (!FormValidator.validateInput(input)) ok = false;
        });
        return ok;
    }

    static validateInput(input) {
        const type = input.getAttribute(ATTRS.inputRequired);
        const value = String(input.value || "");

        const validators = {
            name: () => FormValidator.#validateText(value),
            email: () => FormValidator.#validateEmail(value),
            default: () => FormValidator.#validateText(value),
        };

        const fn = validators[type] || validators.default;
        const isValid = !!fn();

        const row = input.closest?.(`[${ATTRS.row}]`) || null;
        const errorEl = row?.querySelector?.(`[${ATTRS.error}]`) || null;
        const message = VALIDATOR_ERRORS[type] || VALIDATOR_ERRORS.default;

        if (isValid) {
            if (row) row.classList.remove(STATE_CLASSES.isInvalid);
            input.classList.remove(STATE_CLASSES.inputInvalid);
            if (errorEl) errorEl.textContent = "";
        } else {
            if (row) row.classList.add(STATE_CLASSES.isInvalid);
            input.classList.add(STATE_CLASSES.inputInvalid);
            if (errorEl) errorEl.textContent = message;
        }

        return isValid;
    }

    static #validateEmail(v) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(v.trim());
    }

    static #validateText(v) {
        return v.trim() !== "";
    }
}
