export class SectionAnimator {
    constructor() {
        this.#init();
    }

    #init() {
        this.#registerSection("[data-js-services]", this.#animateServices.bind(this));
        this.#registerSection("[data-js-clients]", this.#animateClients.bind(this));
        this.#registerSection("[data-js-contacts]", this.#animateContacts.bind(this));
    }

    #registerSection(selector, callback) {
        const section = document.querySelector(selector);
        if (!section) return;

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        callback(section);
                        obs.disconnect();
                    }
                });
            },
            { threshold: 0.15 }
        );

        observer.observe(section);
    }

    #animateServices(section) {
        const title = section.querySelector("[data-js-services-title]");
        const items = section.querySelectorAll("[data-js-services-item]");

        if (title) title.classList.add("animate");

        items.forEach((item, index) => {
            setTimeout(() => item.classList.add("animate"), index * 200);
        });
    }

    #animateClients(section) {
        const title = section.querySelector("[data-js-clients-title]");
        const description = section.querySelector("[data-js-clients-description]");
        const items = section.querySelectorAll("[data-js-clients-item]");

        if (title) title.classList.add("animate");
        if (description) description.classList.add("animate");

        items.forEach((item, index) => {
            setTimeout(() => item.classList.add("animate"), index * 200);
        });
    }

    #animateContacts(section) {
        const title = section.querySelector("[data-js-contacts-title]");
        const description = section.querySelector("[data-js-contacts-description]");
        const button = section.querySelector("[data-js-contacts-button]");
        const columns = section.querySelectorAll("[data-js-contacts-column]");

        if (title) title.classList.add("animate");
        if (description) setTimeout(() => description.classList.add("animate"), 200);
        if (button) setTimeout(() => button.classList.add("animate"), 400);

        columns.forEach((col, index) => {
            setTimeout(() => col.classList.add("animate"), 600 + index * 200);
        });
    }
}
