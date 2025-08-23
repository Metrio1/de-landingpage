export const STATE_CLASSES = {
    isOpen: "isOpen",
    baseModal: "modal",
    isInvalid: "isInvalid",
    isValid: "isValid",
    inputInvalid: "input--invalid",
    animated: "animate",
};

export const ATTRS = {
    form: "data-js-form",
    inputRequired: "data-js-input-required",
    inputRequiredMode: "data-js-input-required-mode",
    error: "data-js-error-msg",
    row: "data-js-validate-row",
    debounceMs: "data-js-validate-debounce",
    modalOpen: "data-js-modal-open",
    modalType: "data-js-modal-type",
    modalClose: "data-js-modal-close",
};

export const FORM_DEFAULTS = {
    isNeedPreventDefault: true,
    isNeedValidateBeforeSubmit: true,

    request: {
        url: "",
        method: "POST",
        headers: {},
    },

    showModalAfterSuccess: null,
    showModalAfterError: null,
    isResetAfterSuccess: false,

    isNeedShowBackdrop: true,
    closeAfterDelaySuccess: 2000,
    closeAfterDelayError: 3000,
};

export const VALIDATOR_DEFAULTS = {
    debounceMs: 300,
};
export const VALIDATOR_ERRORS = {
    name: "Введите корректное имя",
    email: "Введите корректный адрес электронной почты",
    default: "Это поле обязательно для заполнения",
};

export const SECTION_SELECTORS = {
    services: "[data-js-services]",
    servicesTitle: "[data-js-services-title]",
    servicesItem: "[data-js-services-item]",

    clients: "[data-js-clients]",
    clientsTitle: "[data-js-clients-title]",
    clientsDescription: "[data-js-clients-description]",
    clientsItem: "[data-js-clients-item]",

    contacts: "[data-js-contacts]",
    contactsTitle: "[data-js-contacts-title]",
    contactsDescription: "[data-js-contacts-description]",
    contactsButton: "[data-js-contacts-button]",
    contactsColumn: "[data-js-contacts-column]",
};

export const SECTION_CONFIG = {
    step: 200,
    contactsBaseDelay: 600,
    threshold: 0.15,
};

export const MODAL_BACKDROP_SELECTOR = "[data-js-modal-backdrop]";
