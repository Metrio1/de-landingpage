export class FormValidator {
    static instance = null;

    static attrs = {
        inputRequired: "data-js-input-required",
        inputRequiredMode: "data-js-input-required-mode",
        error: "data-js-error-msg",
        row: "data-js-validate-row",
    };

    static stateClasses = {
        isInvalid: "isInvalid",
        isValid: "isValid",
    };

    constructor() {
        if (FormValidator.instance) {
            return FormValidator.instance;
        }

        this.inputs = document.querySelectorAll(
            `[${FormValidator.attrs.inputRequired}]`
        );
        this.#bindEvents();
        FormValidator.instance = this;
    }

    #bindEvents() {
        document.addEventListener("blur", this.#handleEvent, true);
        document.addEventListener("focus", this.#handleEvent, true);
        document.addEventListener("input", this.#handleEvent, true);
    }

    #handleEvent(event) {
        const input = event.target.closest(
            `[${FormValidator.attrs.inputRequired}]`
        );

        if (!input) {
            return;
        }

        const modeAttribute = input.getAttribute(FormValidator.attrs.inputRequiredMode);
        const modes = modeAttribute ? modeAttribute.trim().split(/\s*,\s*/) : [];

        if (modes.includes(event.type) || event.type === "input") {

            if (input.getAttribute(FormValidator.attrs.inputRequired) === "email") {
                clearTimeout(input.emailValidationTimeout);
                input.emailValidationTimeout = setTimeout(() => {
                    FormValidator.validateInput(input);
                }, 300);
            } else {
                FormValidator.validateInput(input);
            }
        }
    }

    static getValidationForm(form) {
        let isFormValidationPassed  = true;

        [ ...form.elements ].forEach((input) => {
            if (input.matches(`[${FormValidator.attrs.inputRequired}]`) && !FormValidator.validateInput(input)) {
                isFormValidationPassed  = false;
            }
        });

        return isFormValidationPassed ;
    }

    static isValidForm(form, attrs, isNeedValidateBeforeSubmit) {
        if (!form.hasAttribute(attrs.form) || !(form instanceof HTMLFormElement)) {
            return false;
        }

        return !(isNeedValidateBeforeSubmit && !FormValidator.getValidationForm(form));
    }

    static validateInput(input) {
        const validationType = input.getAttribute(FormValidator.attrs.inputRequired);

        const validators = {
            name: () => FormValidator.validateText(input.value),
            email: () => FormValidator.validateEmail(input.value),
        };

        const errorMessages = {
            name: "Введите корректное имя",
            email: "Введите корректный адрес электронной почты",
            message: "Это поле обязательно для заполнения",
        };

        const isValid = validators[validationType]?.() ?? FormValidator.validateText(input.value);
        const errorMessage = errorMessages[validationType] || "Это поле обязательно для заполнения";

        const row = input.closest(`[${FormValidator.attrs.row}]`);
        const errorMsgElement = row?.querySelector(`[${FormValidator.attrs.error}]`);

        isValid
            ? FormValidator.hideError(row, errorMsgElement, input)
            : FormValidator.showError(row, errorMsgElement, errorMessage, input);

        return isValid;
    }

    static validateEmail(value) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value.trim());
    }

    static validateText(value) {
        return value.trim() !== "";
    }

    static showError(row, errorMsgElement, message, input) {
        if (row) {
            row.classList.add(FormValidator.stateClasses.isInvalid);
        }
        if (input) {
            input.classList.add("input--invalid");
        }
        if (errorMsgElement) {
            errorMsgElement.textContent = message;
        }
    }

    static hideError(row, errorMsgElement, input) {
        if (row) {
            row.classList.remove(FormValidator.stateClasses.isInvalid);
        }
        if (input) {
            input.classList.remove("input--invalid");
        }
        if (errorMsgElement) {
            errorMsgElement.textContent = "";
        }
    }
}