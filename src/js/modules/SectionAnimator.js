export class SectionAnimator {
    static dataAttrs = {
        servicesSection: "data-js-services",
        servicesTitle: "data-js-services-title",
        servicesItem: "data-js-services-item",

        clientsSection: "data-js-clients",
        clientsTitle: "data-js-clients-title",
        clientsDescription: "data-js-clients-description",
        clientsItem: "data-js-clients-item",

        contactsSection: "data-js-contacts",
        contactsTitle: "data-js-contacts-title",
        contactsDescription: "data-js-contacts-description",
        contactsButton: "data-js-contacts-button",
        contactsColumn: "data-js-contacts-column",
    };

    static classNames = { animate: "animate" };

    #observer = null;

    constructor({ threshold = 0.15, root = null, rootMargin = "0px" } = {}) {
        this.#observer = new IntersectionObserver(this.#onIntersect, { threshold, root, rootMargin });

        this.#registerSection(`[${SectionAnimator.dataAttrs.servicesSection}]`, (node) => this.#revealServices(node));
        this.#registerSection(`[${SectionAnimator.dataAttrs.clientsSection}]`, (node) => this.#revealClients(node));
        this.#registerSection(`[${SectionAnimator.dataAttrs.contactsSection}]`, (node) => this.#revealContacts(node));
    }

    #onIntersect = (entries, observer) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const cb = entry.target.__onReveal;
                if (typeof cb === "function") cb(entry.target);
                observer.unobserve(entry.target);
            }
        }
    };

    #registerSection(selector, onReveal) {
        const node = document.querySelector(selector);
        if (!node) return;
        node.__onReveal = onReveal;
        this.#observer.observe(node);
    }

    #revealServices(section) {
        section.querySelector(`[${SectionAnimator.dataAttrs.servicesTitle}]`)?.classList.add(SectionAnimator.classNames.animate);
        const items = section.querySelectorAll(`[${SectionAnimator.dataAttrs.servicesItem}]`);
        items.forEach((el, i) => setTimeout(() => el.classList.add(SectionAnimator.classNames.animate), i * 200));
    }

    #revealClients(section) {
        section.querySelector(`[${SectionAnimator.dataAttrs.clientsTitle}]`)?.classList.add(SectionAnimator.classNames.animate);
        section.querySelector(`[${SectionAnimator.dataAttrs.clientsDescription}]`)?.classList.add(SectionAnimator.classNames.animate);
        const items = section.querySelectorAll(`[${SectionAnimator.dataAttrs.clientsItem}]`);
        items.forEach((el, i) => setTimeout(() => el.classList.add(SectionAnimator.classNames.animate), i * 200));
    }

    #revealContacts(section) {
        section.querySelector(`[${SectionAnimator.dataAttrs.contactsTitle}]`)?.classList.add(SectionAnimator.classNames.animate);
        setTimeout(() => section.querySelector(`[${SectionAnimator.dataAttrs.contactsDescription}]`)?.classList.add(SectionAnimator.classNames.animate), 200);
        setTimeout(() => section.querySelector(`[${SectionAnimator.dataAttrs.contactsButton}]`)?.classList.add(SectionAnimator.classNames.animate), 400);
        const cols = section.querySelectorAll(`[${SectionAnimator.dataAttrs.contactsColumn}]`);
        cols.forEach((el, i) => setTimeout(() => el.classList.add(SectionAnimator.classNames.animate), 600 + i * 200));
    }
}
