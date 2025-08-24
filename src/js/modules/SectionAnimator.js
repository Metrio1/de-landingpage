export class SectionAnimator {
    static attrs = {
        services: "data-js-services",
        servicesTitle: "data-js-services-title",
        servicesItem: "data-js-services-item",

        clients: "data-js-clients",
        clientsTitle: "data-js-clients-title",
        clientsDescription: "data-js-clients-description",
        clientsItem: "data-js-clients-item",

        contacts: "data-js-contacts",
        contactsTitle: "data-js-contacts-title",
        contactsDescription: "data-js-contacts-description",
        contactsButton: "data-js-contacts-button",
        contactsColumn: "data-js-contacts-column",
    };

    static classes = { animate: "animate" };

    #observer = null;

    constructor() {
        this.#observer = new IntersectionObserver(this.#onIntersect, { threshold: 0.15 });
        this.#register(`[${SectionAnimator.attrs.services}]`, (section) => this.#animateServices(section));
        this.#register(`[${SectionAnimator.attrs.clients}]`, (section) => this.#animateClients(section));
        this.#register(`[${SectionAnimator.attrs.contacts}]`, (section) => this.#animateContacts(section));
    }

    #onIntersect = (entries, obs) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const cb = entry.target.__onReveal;
                if (typeof cb === "function") cb(entry.target);
                obs.unobserve(entry.target);
            }
        }
    };

    #register(selector, onReveal) {
        const node = document.querySelector(selector);
        if (!node) return;
        node.__onReveal = onReveal;
        this.#observer.observe(node);
    }

    #animateServices(section) {
        section.querySelector(`[${SectionAnimator.attrs.servicesTitle}]`)?.classList.add(SectionAnimator.classes.animate);
        const items = section.querySelectorAll(`[${SectionAnimator.attrs.servicesItem}]`);
        items.forEach((el, i) => setTimeout(() => el.classList.add(SectionAnimator.classes.animate), i * 200));
    }

    #animateClients(section) {
        section.querySelector(`[${SectionAnimator.attrs.clientsTitle}]`)?.classList.add(SectionAnimator.classes.animate);
        section.querySelector(`[${SectionAnimator.attrs.clientsDescription}]`)?.classList.add(SectionAnimator.classes.animate);
        const items = section.querySelectorAll(`[${SectionAnimator.attrs.clientsItem}]`);
        items.forEach((el, i) => setTimeout(() => el.classList.add(SectionAnimator.classes.animate), i * 200));
    }

    #animateContacts(section) {
        section.querySelector(`[${SectionAnimator.attrs.contactsTitle}]`)?.classList.add(SectionAnimator.classes.animate);
        setTimeout(() => section.querySelector(`[${SectionAnimator.attrs.contactsDescription}]`)?.classList.add(SectionAnimator.classes.animate), 200);
        setTimeout(() => section.querySelector(`[${SectionAnimator.attrs.contactsButton}]`)?.classList.add(SectionAnimator.classes.animate), 400);
        const cols = section.querySelectorAll(`[${SectionAnimator.attrs.contactsColumn}]`);
        cols.forEach((el, i) => setTimeout(() => el.classList.add(SectionAnimator.classes.animate), 600 + i * 200));
    }
}