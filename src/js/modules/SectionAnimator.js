import { SECTION_SELECTORS, STATE_CLASSES, SECTION_CONFIG } from "@/js/constants.js";

export class SectionAnimator {
    constructor() {
        this.#init();
    }

    #init() {
        this.#observe(SECTION_SELECTORS.services, (s) => this.#animateServices(s));
        this.#observe(SECTION_SELECTORS.clients, (s) => this.#animateClients(s));
        this.#observe(SECTION_SELECTORS.contacts, (s) => this.#animateContacts(s));
    }

    #observe(selector, onEnter) {
        const section = document.querySelector(selector);
        if (!section) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    onEnter(section);
                    obs.disconnect();
                }
            });
        }, { threshold: SECTION_CONFIG.threshold });

        observer.observe(section);
    }

    #stagger(elements, step = 0, delay = 0) {
        elements.forEach((el, i) => {
            setTimeout(() => el.classList.add(STATE_CLASSES.animated), delay + i * step);
        });
    }

    #animateServices(section) {
        const t = section.querySelector(SECTION_SELECTORS.servicesTitle);
        const items = section.querySelectorAll(SECTION_SELECTORS.servicesItem);
        if (t) t.classList.add(STATE_CLASSES.animated);
        this.#stagger(items, SECTION_CONFIG.step);
    }

    #animateClients(section) {
        const t = section.querySelector(SECTION_SELECTORS.clientsTitle);
        const d = section.querySelector(SECTION_SELECTORS.clientsDescription);
        const items = section.querySelectorAll(SECTION_SELECTORS.clientsItem);
        if (t) t.classList.add(STATE_CLASSES.animated);
        if (d) d.classList.add(STATE_CLASSES.animated);
        this.#stagger(items, SECTION_CONFIG.step);
    }

    #animateContacts(section) {
        const t = section.querySelector(SECTION_SELECTORS.contactsTitle);
        const d = section.querySelector(SECTION_SELECTORS.contactsDescription);
        const b = section.querySelector(SECTION_SELECTORS.contactsButton);
        const cols = section.querySelectorAll(SECTION_SELECTORS.contactsColumn);

        if (t) t.classList.add(STATE_CLASSES.animated);
        if (d) this.#stagger([d], 0, 200);
        if (b) this.#stagger([b], 0, 400);
        this.#stagger(cols, SECTION_CONFIG.step, SECTION_CONFIG.contactsBaseDelay);
    }
}
