export class SectionAnimator {
    static selectors = {
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

    static animationConfig = {
        step: 200,
        contactsBaseDelay: 600,
    };

    constructor() {
        this.#init();
    }

    #init() {
        this.#registerSection(SectionAnimator.selectors.services, this.#animateServices.bind(this));
        this.#registerSection(SectionAnimator.selectors.clients, this.#animateClients.bind(this));
        this.#registerSection(SectionAnimator.selectors.contacts, this.#animateContacts.bind(this));
    }

    #registerSection(selector, callback) {
        const section = document.querySelector(selector);
        if (!section) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    callback(section);
                    obs.disconnect();
                }
            });
        }, { threshold: 0.15 });

        observer.observe(section);
    }

    #applyAnimation(elements, step = 0, initialDelay = 0) {
        elements.forEach((el, index) => {
            setTimeout(() => el.classList.add("animate"), initialDelay + index * step);
        });
    }

    #animateServices(section) {
        const { servicesTitle, servicesItem } = SectionAnimator.selectors;
        const title = section.querySelector(servicesTitle);
        const items = section.querySelectorAll(servicesItem);

        if (title) title.classList.add("animate");
        this.#applyAnimation(items, SectionAnimator.animationConfig.step);
    }

    #animateClients(section) {
        const { clientsTitle, clientsDescription, clientsItem } = SectionAnimator.selectors;
        const title = section.querySelector(clientsTitle);
        const description = section.querySelector(clientsDescription);
        const items = section.querySelectorAll(clientsItem);

        if (title) title.classList.add("animate");
        if (description) description.classList.add("animate");
        this.#applyAnimation(items, SectionAnimator.animationConfig.step);
    }

    #animateContacts(section) {
        const { contactsTitle, contactsDescription, contactsButton, contactsColumn } = SectionAnimator.selectors;
        const title = section.querySelector(contactsTitle);
        const description = section.querySelector(contactsDescription);
        const button = section.querySelector(contactsButton);
        const columns = section.querySelectorAll(contactsColumn);

        if (title) title.classList.add("animate");
        if (description) this.#applyAnimation([description], 0, 200);
        if (button) this.#applyAnimation([button], 0, 400);
        this.#applyAnimation(columns, SectionAnimator.animationConfig.step, SectionAnimator.animationConfig.contactsBaseDelay);
    }
}
